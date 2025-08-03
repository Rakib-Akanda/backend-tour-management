/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserToken } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);
    passport.authenticate("local", async (error: any, user: any, info: any) => {
      if (error) {
        // DON"T USE
        // throw new AppError(401, "Some error")
        // next(error)
        // return new AppError(StatusCodes.UNAUTHORIZED, error)

        // use it
        // return next(error)
        // console.log(error, "error credential login");
        return next(new AppError(error.statusCode || 401, error.message));
      }
      if (!user) {
        // return new AppError(StatusCodes.UNAUTHORIZED, info.message)
        return next(
          new AppError(
            StatusCodes.UNAUTHORIZED,
            info.message || "Authentication failed"
          )
        );
      }
      const userToken = await createUserToken(user);
      const { password: pass, ...rest } = user.toObject();

      // setAuthCookie(res, loginInfo);
      setAuthCookie(res, userToken);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Logged In Successfully",
        data: {
          accessToken: userToken.accessToken,
          refreshToken: userToken.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);

    // res.cookie("accessToken", loginInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    // });

    // res.cookie("refreshToken", loginInfo.refreshToken, {
    //   httpOnly: true,
    //   secure: false,
    // });

    // setAuthCookie(res, loginInfo);

    // sendResponse(res, {
    //   success: true,
    //   statusCode: StatusCodes.OK,
    //   message: "User Logged In Successfully",
    //   data: loginInfo,
    // });
  }
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "No refresh token from cookies"
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string
    );
    // res.cookie("accessToken", tokenInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    // });
    setAuthCookie(res, tokenInfo);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "New Access token Retrieve Successfully",
      data: tokenInfo,
    });
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User Logged Out Successfully",
      data: null,
    });
  }
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);
const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body as JwtPayload;
    const decodedToken = req.user as JwtPayload;
    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password Set Successfully",
      data: null,
    });
  }
);
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await AuthServices.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Email Sent Successfully",
      data: null,
    });
  }
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);
const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";
    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }
    // /booking => booking, => "/" = ""
    const user = req.user;
    // console.log("user", user);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }
    const tokenInfo = createUserToken(user);

    setAuthCookie(res, tokenInfo);
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);

    // sendResponse(res, {
    //   success: true,
    //   statusCode: StatusCodes.OK,
    //   message: "Password Changed Successfully",
    //   data: null,
    // });
  }
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  forgotPassword,
  changePassword,
  setPassword,
  googleCallbackController,
};
