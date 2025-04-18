import { DateProvider } from "@/domain/users/application/date/date-provider";
import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

@Injectable()
export class DayjsProvider implements
  DateProvider {
  compareInYears(startDate: Date, endDate: Date): number {
    const endDateUtc = this.convertToUTC(endDate);
    const startDateUtc = this.convertToUTC(startDate);

    return dayjs(endDateUtc).diff(startDateUtc, "years");
  }
  compareInHours(startDate: Date, endDate: Date): number {
    const endDateUtc = this.convertToUTC(endDate);
    const startDateUtc = this.convertToUTC(startDate);

    return dayjs(endDateUtc).diff(startDateUtc, "hours");
  }
  convertToUTC(date: Date): string {
    return dayjs(date).utc().local().format();
  }
  dateNow(): Date {
    return dayjs().toDate();
  }
  compareInDays(startDate: Date, endDate: Date): number {
    const endDateUtc = this.convertToUTC(endDate);
    const startDateUtc = this.convertToUTC(startDate);

    return dayjs(endDateUtc).diff(startDateUtc, "days");
  }
  addDays(days: number): Date {
    return dayjs().add(days, "days").toDate();
  }
  addHours(hours: number): Date {
    return dayjs().add(hours, "hours").toDate();
  }
  
}