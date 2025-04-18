export abstract class DateProvider {
  abstract compareInHours(startDate: Date, endDate: Date): number
  abstract compareInYears(startDate: Date, endDate: Date): number
  abstract convertToUTC(date: Date): string
  abstract dateNow(): Date
  abstract compareInDays(startDate: Date, endDate: Date): number
  abstract addDays(days: number): Date
  abstract addHours(hours: number): Date
}