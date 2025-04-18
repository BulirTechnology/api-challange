import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { ClientCancelJobUseCase } from "@/domain/work/application/use-case/jobs/job-cancel-reason/client-job-cancel";
import { z } from "zod";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const clientJobCancelBodySchema = z.object({
  reason: z.string({
    invalid_type_error: "job_cancel.client_reason.invalid_type_error",
    required_error: "job_cancel.client_reason.invalid_type_error"
  }),
  description: z.string({
    invalid_type_error: "job_cancel.client_reason_description.invalid_type_error",
    required_error: "job_cancel.client_reason_description.invalid_type_error"
  }),
});

type ClientJobCancelBodySchema = z.infer<typeof clientJobCancelBodySchema>

@ApiTags("Jobs")
@Controller("/jobs")
@UseGuards(JwtAuthGuard)
export class ClientJobCancelController {
  constructor(
    private clientCancelJob: ClientCancelJobUseCase,
    private validation: ValidationService,
  ) { }

  @Post(":jobId/cancel")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("jobId") jobId: string,
    @Body() data: ClientJobCancelBodySchema
  ) {
    try {
      await this.validation.validateData(clientJobCancelBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.clientCancelJob.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      jobId,
      reasonId: data.reason,
      description: data.description
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}