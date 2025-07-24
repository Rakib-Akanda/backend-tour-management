"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name too short. Minimum 2 character long" })
        .max(50, { message: "Name too long" }),
    email: zod_1.default
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email format." })
        .min(8, { message: "Email must be at least 8 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    age: zod_1.default.number({ invalid_type_error: "Age must be a number" }),
    // 1 uppercase, 1 special character, 1 digit, 8 character min
    password: zod_1.default
        .string({ invalid_type_error: "Password must be string." })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must be at least 1 special character",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number",
    }),
    phone: zod_1.default
        .string({ invalid_type_error: "Phone number must be a string" })
        .regex(/^()/, {
        message: "Phone number must be valid for Bangladesh. Formate +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address cannot exceed 100 characters" })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name too short. Minimum 2 character long" })
        .max(50, { message: "Name too long" })
        .optional(),
    // 1 uppercase, 1 special character, 1 digit, 8 character min
    password: zod_1.default
        .string({ invalid_type_error: "Password must be string." })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must be at least 1 special character",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number",
    })
        .optional(),
    phone: zod_1.default
        .string({ invalid_type_error: "Phone number must be a string" })
        .regex(/^()/, {
        message: "Phone number must be valid for Bangladesh. Formate +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address cannot exceed 100 characters" })
        .optional(),
    role: zod_1.default
        //   .enum(["ADMIN", "GUIDE", "USER", SUPER_ADMIN])
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default
        .boolean({
        invalid_type_error: "isDeleted must be true or false",
    })
        .optional(),
    isVerified: zod_1.default
        .boolean({
        invalid_type_error: "isVerified must be true or false",
    })
        .optional(),
});
