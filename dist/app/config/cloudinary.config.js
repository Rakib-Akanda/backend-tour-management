"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Frontend => Form Data With Image File => Multer => Form data => Req  (Body + File)
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
exports.cloudinaryUpload = exports.deleteImageFromCloudinary = exports.uploadBufferToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = require("http-status-codes");
const stream_1 = __importDefault(require("stream"));
// Amader Folder -> image -> form data -> File -> Multer ->Amader project /PC te Nijer ekta folder(temporary rakhbe) -> req.file
// req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.cloudinary.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.cloudinary.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.cloudinary.CLOUDINARY_API_SECRET,
});
const uploadBufferToCloudinary = (buffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`;
            const bufferStream = new stream_1.default.PassThrough();
            bufferStream.end(buffer);
            cloudinary_1.v2.uploader
                .upload_stream({
                resource_type: "auto",
                public_id: public_id,
                folder: "pdf",
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            })
                .end(buffer);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, `Error uploading file ${error.message}`);
    }
});
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
const deleteImageFromCloudinary = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // https://res.cloudinary.com/dhyqof6ml/image/upload/v1753264887/y1hh41lmfq-1753264884967-20221130-115822--1-.jpg.jpg.jpg
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);
        if (match && match[1]) {
            const public_id = match[1];
            yield cloudinary_1.v2.uploader.destroy(public_id);
            //   console.log(`file ${public_id} is  deleted from cloudinary`);
        }
    }
    catch (error) {
        throw new AppError_1.default(401, "Cloudinary image deletion  failed ", error.message);
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.cloudinaryUpload = cloudinary_1.v2;
// const uploadToCloudinary = cloudinary.uploader.upload(); // eta use nah kore ekta package er maddhome korbo
//
// Multer Storage Cloudinary
// Amader Folder -> image -> form data -> File -> Multer -> storage in cloudinary -> req.file -> req.file -> url -> req.file -> mongoose -> mongodb
