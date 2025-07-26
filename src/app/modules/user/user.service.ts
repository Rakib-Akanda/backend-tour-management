import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };
  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
    if (userId !== decodedToken.userId) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
    }
  }
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
  }

  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
    }
    // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
    //   throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
    // }
  }
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
    }
  }
  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");
  return newUpdateUser;
};

const getAllUsers = async () => {
  const users = await User.find({}).select("-password");

  const totalUser = await User.countDocuments();
  return { data: users, meta: { total: totalUser } };
};
const getSingleUsers = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return { data: user };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return { data: user };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUsers,
  getMe,
  updateUser,
};

/** update user
    email - can not update
    update--
    name, phone, password, address,
    password - rehashing
    only admin and superAdmin can update - role, isDeleted....
    promoting to super admin - only super admin
      
 এই কোডটি মূলত কেউ কোনো ইউজারের ডেটা আপডেট করার সময়, আপডেট করতে পারবে কি না, সেই অধিকার (authorization) যাচাই করছে।

✅ ব্যাখ্যা:
if (payload.role) {
🔸 যদি ক্লায়েন্ট (যে রিকুয়েস্ট পাঠাচ্ছে) ইউজারের role পরিবর্তন করতে চায়, তাহলে...

if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
  throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
}
🔸 যদি রিকুয়েস্ট পাঠানো ইউজার নিজে USER অথবা GUIDE হয়,
🔸 তাহলে তার role পরিবর্তনের অনুমতি নেই,
🔸 তাই FORBIDDEN (403) এরর দেওয়া হবে: "You are not authorized"

📌 অর্থাৎ সাধারণ ইউজার বা গাইডরা অন্য কাউকে role দিতে পারবে না।

if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
  throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
}
🔸 যদি ইউজার কারো role কে SUPER_ADMIN বানাতে চায়,
🔸 কিন্তু সে নিজে শুধু ADMIN হয়,
🔸 তাহলে তাকে অনুমতি দেওয়া হবে না।

📌 অর্থাৎ ADMIN রা SUPER_ADMIN তৈরি করতে পারবে না।

if (payload.isActive || payload.isDeleted || payload.isVerified) {
🔸 যদি রিকুয়েস্টের মাধ্যমে কেউ ইউজারের isActive, isDeleted বা isVerified ফিল্ডগুলো পরিবর্তন করতে চায়, তাহলে...

if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
  throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized");
}
🔸 যদি রিকুয়েস্ট পাঠানো ইউজার USER বা GUIDE হয়,
🔸 তাহলে এই ধরণের সেনসিটিভ স্টেট (active/deleted/verified) পরিবর্তনের অনুমতি নেই।

📌 অর্থাৎ সাধারণ ইউজার ও গাইডরা কাউকে অ্যাক্টিভ/ডিলিটেড/ভেরিফায়েড করতে পারবে না।

🔚 সারসংক্ষেপ (Summary in Bangla):
সাধারণ USER বা GUIDE কাউকে:

role দিতে পারবে না,

verified/active/deleted status পরিবর্তন করতে পারবে না।

ADMIN হলেও সে কাউকে SUPER_ADMIN বানাতে পারবে না।
  */
