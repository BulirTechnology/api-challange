import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccountType } from "@prisma/client";
import { AuthenticatedUser } from "./authenticated-user-decorator";
import { UsersRepository } from "@/domain/users/application/repositories";

export function AccountTypeGuard(accountType: AccountType): Type<CanActivate> {
  @Injectable()
  class AccountTypeGuardMixin implements CanActivate {
    constructor(
      private reflector: Reflector,
      private usersRepository: UsersRepository
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        return false;
      }

      const loggedUser = await this.usersRepository.findById(user.sub);
      return loggedUser?.accountType === accountType;
    }
  }

  return mixin(AccountTypeGuardMixin);
}
