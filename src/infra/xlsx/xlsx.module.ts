import { Module } from "@nestjs/common";
import { ExcelService } from "./xlsx.service";

@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
