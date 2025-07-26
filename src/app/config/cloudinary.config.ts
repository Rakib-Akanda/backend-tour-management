/* eslint-disable @typescript-eslint/no-explicit-any */
// Frontend => Form Data With Image File => Multer => Form data => Req  (Body + File)

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import stream from "stream";

// Amader Folder -> image -> form data -> File -> Multer ->Amader project /PC te Nijer ekta folder(temporary rakhbe) -> req.file

// req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb

cloudinary.config({
  cloud_name: envVars.cloudinary.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.cloudinary.CLOUDINARY_API_KEY,
  api_secret: envVars.cloudinary.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${fileName}-${Date.now()}`;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            public_id: public_id,
            folder: "pdf",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      `Error uploading file ${error.message}`
    );
  }
};

export const deleteImageFromCloudinary = async (url: string) => {
  try {
    // https://res.cloudinary.com/dhyqof6ml/image/upload/v1753264887/y1hh41lmfq-1753264884967-20221130-115822--1-.jpg.jpg.jpg
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      //   console.log(`file ${public_id} is  deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new AppError(
      401,
      "Cloudinary image deletion  failed ",
      error.message
    );
  }
};
export const cloudinaryUpload = cloudinary;

// const uploadToCloudinary = cloudinary.uploader.upload(); // eta use nah kore ekta package er maddhome korbo

//
// Multer Storage Cloudinary
// Amader Folder -> image -> form data -> File -> Multer -> storage in cloudinary -> req.file -> req.file -> url -> req.file -> mongoose -> mongodb
