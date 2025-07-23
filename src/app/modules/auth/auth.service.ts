/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
// import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IAuthProvider } from "../user/user.interface";
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
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  // const user = await User.findById(decodedToken.userId)
  // if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  // const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user.password as string);
  // if (!isOldPasswordMatch) {
  //   throw new AppError(StatusCodes.UNAUTHORIZED, "Old password does not match")
  // }

  // user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
  // await user.save()
  return null;
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
// user - login - jwt token(email, role, _id) - booking / payment / payment or booking cancel-  token

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  resetPassword,
};
