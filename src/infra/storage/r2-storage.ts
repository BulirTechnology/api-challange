import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { UploadParams, Uploader } from "@/core/storage/uploader";
import { EnvService } from "../environment/env.service";

@Injectable()
export class R2Storage implements Uploader {
  private client: S3Client;

  constructor(
    private envService: EnvService
  ) {
    const accountId = envService.get("CLOUDFLARE_ACCOUNT_ID");
    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      credentials: {
        accessKeyId: envService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: envService.get("AWS_SECRET_KEY_ID")
      }
    });
  }

  async upload({
    body,
    fileName,
    fileType
  }: UploadParams): Promise<{ url: string; }> {
    const uploadId = randomUUID();

    const uniqueFileName = `${uploadId}-${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get("AWS_BUCKET_NAME"),
        ContentType: fileType,
        Body: body,
        Key: uniqueFileName
      })
    );

    return {
      url: uniqueFileName
    };
  }

}