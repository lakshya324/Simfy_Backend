import multer from "multer"
import { imageSize } from "../config/config";
import { AuthRequest } from "../types/types";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/temp')
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
//   })

const storage = multer.memoryStorage();
const fileFilter = (req:AuthRequest, file:Express.Multer.File, cb:multer.FileFilterCallback) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
export default multer({ storage: storage, limits: { fileSize: 1024 * 1024 * imageSize },fileFilter:fileFilter });