import { Injectable } from "@nestjs/common";
import { ZodRawShape, z, ZodEffects, ZodObject } from "zod";
import { I18nContext, I18nService } from "nestjs-i18n";

type ErrorType = { message: string; path: string[] };
type ThrowError = { errors: ErrorType[] };

@Injectable()
export class ValidationService {
  constructor(private readonly i18n: I18nService) {}

  async validateData(
    schema: ZodObject<ZodRawShape> | ZodEffects<ZodObject<ZodRawShape>>,
    data: unknown
  ) {
    try {
      schema.parse(data);
    } catch (error) {
      const localizedErrors = await this.getLocalisedErrors(
        (error as ThrowError).errors
      );
      throw localizedErrors;
    }
  }

  private async getLocalisedErrors(errors: ErrorType[]) {
    const errorMessages = {};
    for (const error of errors) {
      errorMessages[error.path[0]] = this.i18n.translate(
        `errors.${error.message}`,
        { args: { field: error.path[0] }, lang: I18nContext.current()?.lang }
      );
    }
    return errorMessages;
  }
}
