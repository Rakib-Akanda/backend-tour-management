/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User Logged In Successfully",
      data: loginInfo,
    });
  }
);

export const AuthControllers = {
  credentialsLogin,
};
