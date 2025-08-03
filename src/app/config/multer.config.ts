import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import { sanitizeFileName } from "../utils/sanitizeFileName";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file) => {
      // // My special.image.png => 2349032940230-23923-my-image.png

      // const fileName = file.originalname
      //   .toLowerCase()
      //   .replace(/\s+/g, "-") // empty space remove replace with dash
      //   .replace(/\./g, "-")
      //   // eslint-disable-next-line no-useless-escape
      //   .replace(/[^a-z0-9\-\.]/g, "-"); // no alpha numeric - !@#$%&(*)
      // const extension = file.originalname.split(".").pop();

      // // binary -> 0, 1, hexadecimal = 0-9 A-F, base36 -> 0-9 A-Z ei total 36 er random string hobe;
      // // 0.3293849833 -> "0.kfj2fk3jk323234" ekhane subString "kfj2fk3jk323234" eta nibe
      // //Date.now = 3993823893
      // const uniqueFileName =
      //   Math.random().toString(36).substring(2) +
      //   "-" +
      //   Date.now() +
      //   "-" +
      //   fileName +
      //   "." +
      //   extension;

      return sanitizeFileName(file.originalname);
    },
  },
});

export const multerUpload = multer({
  storage: storage,
});
