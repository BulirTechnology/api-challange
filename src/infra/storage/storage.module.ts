import { Module } from "@nestjs/common";

import { EnvModule } from "../environment/env.module";
import { Uploader } from "@/core/storage/uploader";
/* import { LocalStorage } from "./local-storage"; */
/* import { R2Storage } from "./r2-storage"; */
import { CloudinaryStorage } from "./cloudnary-storage";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: CloudinaryStorage
    }
  ],
  exports: [
    Uploader
  ]
})
export class StorageModule {}