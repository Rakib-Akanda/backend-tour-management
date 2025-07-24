"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User Already Exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = {
        provider: "credentials",
        providerId: email,
    };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, auths: [authProvider] }, rest));
    return user;
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User Not Found");
    }
    ;
    /** email - can not update
    * update--
    * name, phone, password, address,
    * password - rehashing
    * only admin and superAdmin can update - role, isDeleted....
    * promoting to super admin - only super admin
    *
    *
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
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER || decodedToken.role === user_interface_1.Role.GUIDE) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, env_1.envVars.BCRYPT_SALT_ROUND);
    }
    const newUpdateUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    }).select("-password");
    return newUpdateUser;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({}).select("-password");
    const totalUser = yield user_model_1.User.countDocuments();
    return { data: users, meta: { total: totalUser } };
});
const getSingleUsers = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return { data: user };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return { data: user };
});
exports.UserServices = {
    createUser,
    getAllUsers,
    getSingleUsers,
    getMe,
    updateUser,
};
