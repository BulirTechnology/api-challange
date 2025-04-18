import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidActiveServiceProviderState extends Error
  implements UseCaseError {
  field: string;
  constructor(state: string) {
    super(`We can not active the service provider. Because it is missing to setup the: ${state}`);
    this.field = "service_provider";
  }
}