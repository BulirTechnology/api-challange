import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { AuthPayload } from "./jwt.strategy";

export const AuthenticatedUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as AuthPayload;
  }
);