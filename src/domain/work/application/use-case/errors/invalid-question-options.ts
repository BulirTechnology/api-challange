import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidQuestionOptionError extends Error
  implements UseCaseError {
  constructor() {
    super("Invalid question option");
  }
}