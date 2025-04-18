

import { Injectable } from "@nestjs/common";
import { UploadParams, Uploader } from "@/core/storage/uploader";
import { EnvService } from "../environment/env.service";

@Injectable()
export class LocalStorage implements Uploader {

  constructor(
    private envService: EnvService
  ) {
  }

  async upload(data: UploadParams): Promise<{ url: string; }> {
    console.log(data);

    return {
      url: "uniqueFileName"
    };
  }

}