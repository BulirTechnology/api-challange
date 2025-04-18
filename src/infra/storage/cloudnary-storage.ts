import { Injectable } from "@nestjs/common";
import { UploadParams, Uploader } from "@/core/storage/uploader";
import { EnvService } from "../environment/env.service";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryStorage implements Uploader {

  constructor(
    private envService: EnvService
  ) {}

  async upload({
    body,
  }: UploadParams): Promise<{ url: string; }> {
    await cloudinary.config({
      cloud_name: this.envService.get("CLOUDINARY_NAME"),
      api_key: this.envService.get("CLOUDNARY_API_KEY"),
      api_secret:this.envService.get("CLOUDNARY_API_SECRET"),
    });
    const response = await (new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result: CloudinaryResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(body).pipe(uploadStream);
    }));

    return {
      url: response["public_id"]
    };
  }

}