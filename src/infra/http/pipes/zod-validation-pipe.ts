import {
  PipeTransform,
  BadRequestException,
  Injectable
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema
  ) { }

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const transformedError = this.transformZodError(error);
        throw new BadRequestException(transformedError);
      }

      throw new BadRequestException("Validation failed");
    }
  }

  private transformZodError(error: ZodError): { message: string; errors: unknown[] } {

    return {
      message: "Validation Failed",
      errors: error.errors.map((err) => ({
        resource: err.path[0] ?? "Unknown",
        code: err.code,
        field: err.path[1] ?? "Unknown",
        message: err.message,
      })),
    };
  }
}
