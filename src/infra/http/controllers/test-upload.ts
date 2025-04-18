//files.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import {
  FileInterceptor,
} from "@nestjs/platform-express";
import multerConfig from "@/infra/storage/multer";
import { Public } from "@/infra/auth/public";
import path from "path";
import multer from "multer";

@Controller("files")
export class FilesController {

  @Post()
  @Public()
  @UseInterceptors(FileInterceptor("arquivo", {
    ...multerConfig,
    limits: {
      fieldSize: 200
    },
    fileFilter: (req, file, callback) => {
      const fileSize = parseInt(req.headers["content-length"]);
      const acceptableExtensions = [".sdkj", ".sdkjsd"];
      if (!(acceptableExtensions.includes(path.extname(file.originalname)))) {
        return callback(
          new UnsupportedMediaTypeException("Only excel files are allowed"),
          false);
      }
      if (fileSize > 200) {
        return callback(new Error("File to large"), false);
      }

      callback(null, true);
    } 
  }))
  uploadArquivo(@UploadedFile() file: Express.MulterS3.File) {
    if (multer.MulterError) {
      throw new BadRequestException("Max fields allowed are 5");
    }
    try {
      console.log(file.key);
      return {
        dados: file
      };
    } catch(err) {
      console.log("error");
    }

  }

}
