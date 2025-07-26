import crypto from "crypto";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
const OTP_EXPIRATION = 2 * 60; // 2minute

const generateOtp = (length = 6) => {
  // 6 digit otp,
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString(); // 100000 - 999999
  // 10 ** 5 => 10 * 10 * 10 * 10 * 10 = 100000;
  return otp;
};

const sendOTP = async (email: string, name: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (user.isVerified) {
    throw new AppError(StatusCodes.NOT_FOUND, "You are already verified");
  }
  const otp = generateOtp();
  const redisKey = `otp:${email}`;
  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });
  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: name,
      otp: otp,
    },
  });
};
const verifyOTP = async (email: string, otp: string) => {
  //   const user = await User.findOne({ email, isVerified: false }); // ekhane isVerified: false ache je user der just tarai ashbe, but eta korle kuno kiso boja jabe nah.
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (user.isVerified) {
    throw new AppError(StatusCodes.NOT_FOUND, "You are already verified");
  }
  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);
  if (!savedOtp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid OTP");
  }
  if (savedOtp !== otp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid OTP");
  }
  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
