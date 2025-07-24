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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const division_model_1 = require("./division.model");
const createDivision = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new AppError_1.default(409, "Exist Division");
    }
    //   const baseSlug = payload.name.toLowerCase().split(" ").join("-");
    //   let slug = `${baseSlug}-division`;
    //   let counter = 0;
    //   while (await Division.exists({ slug })) {
    //     slug = `${slug}-${counter++}`; // dhaka-division-1
    //   }
    //   payload.slug = slug;
    const division = yield division_model_1.Division.create(payload);
    return division;
});
const getAllDivision = () => __awaiter(void 0, void 0, void 0, function* () {
    const divisions = yield division_model_1.Division.find({});
    const totalDivisions = yield division_model_1.Division.countDocuments();
    return {
        data: divisions,
        meta: {
            total: totalDivisions,
        },
    };
});
const getSingleDivision = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const division = yield division_model_1.Division.findOne({ slug });
    return {
        data: division,
    };
});
const updateDivision = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(id);
    if (!existingDivision) {
        throw new AppError_1.default(404, "Not found division");
    }
    const duplicateDivision = yield division_model_1.Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new AppError_1.default(409, "A division with this name already exists.");
    }
    //   if (payload.name) {
    //     const baseSlug = payload.name.toLowerCase().split(" ").join("-");
    //     let slug = `${baseSlug}-division`;
    //     let counter = 0;
    //     while (await Division.exists({ slug })) {
    //       slug = `${slug}-${counter++}`;
    //     }
    //     payload.slug = slug;
    //   }
    const updateDivision = yield division_model_1.Division.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    // console.log(payload.thumbnail);
    if (payload.thumbnail && existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(existingDivision.thumbnail);
    }
    return updateDivision;
});
const deleteDivision = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedDivision = yield division_model_1.Division.findByIdAndDelete(id);
    if (!deletedDivision) {
        throw new AppError_1.default(404, "Division Not Found");
    }
    return null;
});
exports.DivisionService = {
    createDivision,
    getAllDivision,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};
