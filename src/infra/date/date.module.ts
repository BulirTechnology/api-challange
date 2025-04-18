import { Module } from "@nestjs/common";
import { DayjsProvider } from "./dayjs-provider";
import { DateProvider } from "@/domain/users/application/date/date-provider";

@Module({
  providers: [
    {
      provide: DateProvider,
      useClass: DayjsProvider
    },
  ],
  exports: [
    DateProvider,
  ]
})
export class DateModule {}