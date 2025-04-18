import { I18nContext, I18nService } from "nestjs-i18n";

export function processI18nMessage(i18nService: I18nService, field: string, lang?: string): string {
  return i18nService.t(
    field,
    {
      lang: lang ?? I18nContext.current()?.lang
    })
}