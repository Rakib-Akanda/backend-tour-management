/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
// import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IAuthProvider, IsActive } from "../user/user.interface";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "User does not Exist");
//   }

//   const isPasswordMatched = await bcryptjs.compare(
//     password as string,
//     isUserExist.password as string
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(StatusCodes.BAD_REQUEST, "Incorrect Password");
//   }

//   // const jwtPayload = {
//   //   userId: isUserExist._id,
//   //   email: isUserExist.email,
//   //   role: isUserExist.role,
//   // };
//   // //   const accessToken = jwt.sign(jwtPayload, "secret", { expiresIn: "1d" });
//   // const accessToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_ACCESS_SECRET,
//   //   envVars.JWT_ACCESS_EXPIRES
//   // );
//   // const refreshToken = generateToken(
//   //   jwtPayload,
//   //   envVars.JWT_REFRESH_SECRET,
//   //   envVars.JWT_REFRESH_EXPIRES
//   // );

//   const userToken = createUserToken(isUserExist);

//   // password hide korar jonno api and frontend er jonno
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const { password: pass, ...rest } = isUserExist.toObject();

//   return {
//     accessToken: userToken.accessToken,
//     refreshToken: userToken.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload
) => {
  if (payload.id != decodedToken.userId) {
    throw new AppError(401, "You can not reset you password");
  }
  const isUserExist = await User.findById(decodedToken.userId);
  if (!isUserExist) {
    throw new AppError(404, "User does not exist");
  }
  const hashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  isUserExist.password = hashedPassword;

  await isUserExist.save();
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Old password does not match");
  }

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  await user.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
  }
  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You have already set your password. Now you can change the password from your profile password update."
    );
  }
  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  const credentialsProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };
  const auths: IAuthProvider[] = [...user.auths, credentialsProvider];

  user.password = hashedPassword;
  user.auths = auths;

  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User does not Exist");
  }
  if (!isUserExist.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not Verified");
  }
  if (
    isUserExist.isActive === IsActive.BLOCKED ||
    isUserExist.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `User is ${isUserExist.isActive}`
    );
  }
  if (isUserExist.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
  }
  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};
// user - login - jwt token(email, role, _id) - booking / payment / payment or booking cancel-  token

// http://localhost:5173/reset-password?id=6882626a0412b0693d5b9a4c&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODgyNjI2YTA0MTJiMDY5M2Q1YjlhNGMiLCJlbWFpbCI6ImFsb3JnYWxwYUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1MzM3NjA3MywiZXhwIjoxNzUzMzc2NjczfQ.pUw12AhutrlSyHbGGS-q5NfcJzcIsiB0z0HRD0Lr3Pc

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword,
};
