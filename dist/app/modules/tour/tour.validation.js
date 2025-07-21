"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTourTypeZodSchema = exports.updateTourZodSchema = exports.createTourZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTourZodSchema = zod_1.default.object({
    title: zod_1.default.string(),
    //   slug: z.string().optional(),
    description: zod_1.default.string().optional(),
    //   images: z.array(z.string()).optional(),
    location: zod_1.default.string().optional(),
    costFrom: zod_1.default.number().optional(),
    startDate: zod_1.default.string().optional(),
    endDate: zod_1.default.string().optional(),
    inCluded: zod_1.default.array(zod_1.default.string()).optional(),
    exCluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    maxGuests: zod_1.default.number().optional(),
    minAge: zod_1.default.number().optional(),
    division: zod_1.default.string(),
    tourType: zod_1.default.string(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
});
exports.updateTourZodSchema = zod_1.default.object({
    title: zod_1.default.string().optional(),
    //   slug: z.string().optional(),
    description: zod_1.default.string().optional(),
    //   images: z.array(z.string()).optional(),
    location: zod_1.default.string().optional(),
    costFrom: zod_1.default.number().optional(),
    startDate: zod_1.default.string().optional(),
    endDate: zod_1.default.string().optional(),
    inCluded: zod_1.default.array(zod_1.default.string()).optional(),
    exCluded: zod_1.default.array(zod_1.default.string()).optional(),
    amenities: zod_1.default.array(zod_1.default.string()).optional(),
    tourPlan: zod_1.default.array(zod_1.default.string()).optional(),
    maxGuests: zod_1.default.number().optional(),
    minAge: zod_1.default.number().optional(),
    division: zod_1.default.string().optional(),
    tourType: zod_1.default.string().optional(),
    departureLocation: zod_1.default.string().optional(),
    arrivalLocation: zod_1.default.string().optional(),
});
exports.createTourTypeZodSchema = zod_1.default.object({
    name: zod_1.default.string(),
});
