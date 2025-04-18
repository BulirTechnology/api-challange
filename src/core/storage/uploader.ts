export abstract class Uploader {
  abstract upload(params: UploadParams): Promise<{ url: string }>
}

export interface UploadParams {
  fileName: string
  fileType: string
  body: Buffer
}