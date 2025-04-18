import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WrongCredentialsError } from "@/domain/users/application/use-cases/errors";
import { SessionHydrateUseCase } from "@/domain/users/application/use-cases/user/authentication/session-hydate";
import { EnvService } from "@/infra/environment/env.service";
import { JwtService } from "@nestjs/jwt";
import { Public } from "@/infra/auth/public";

@ApiTags("Sessions")
@Controller("/sessions")
@Public()
export class SessionHydrateController {
  constructor(
    private env: EnvService,
    private jwtService: JwtService,
    private sessionHydrate: SessionHydrateUseCase
  ) { }

  @Get("hydrate")
  async handle(
    @Headers() headers: Record<string, string>
  ) {
    const decoded = this.jwtService.verify(headers['authorization'].replace("Bearer ", ""), {
      secret: this.env.get('JWT_REFRESH_KEY')
    })

    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException("");
    }

    const expirationDate = new Date(decoded.exp * 1000);
    const currentDate = new Date();

    if (currentDate > expirationDate) {
      throw new UnauthorizedException("");
    }

    const result = await this.sessionHydrate.execute({
      userId: decoded.sub
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const clientResponse = {
      pending_request_to_start_or_finish: result.value.pendingRequestToStartOrFinish,
      unreaded_messages: result.value.unreadedMessages,
      unreaded_notifications: result.value.unreadedNotifications,
      unreaded_quotations: result.value.unreadedQuotations
    }
    const spResponse = {
      total_accepted_or_reject_bookings: result.value.totalAcceptedOrRejectedBooking,
      news_near_jobs: result.value.newsNearJobs,
      unreaded_messages: result.value.unreadedMessages,
      unreaded_notifications: result.value.unreadedNotifications,
    }

    return result.value.accountType === "Client" ? clientResponse : spResponse
  }
}
