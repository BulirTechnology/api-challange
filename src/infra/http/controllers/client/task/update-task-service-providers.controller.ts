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

import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { UpdateTaskPrivateServiceProvidersUseCase } from "@/domain/work/application/use-case/tasks/update-task-private-service-providers";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateTaskPrivateServiceProvidersBodySchema = z.object({
  service_provider_ids: z.array(z.string({
    invalid_type_error: "task.service_provider_ids.invalid_type_error",
    required_error: "task.service_provider_ids.invalid_type_error"
  })),
});

type UpdateTaskPrivateServiceProvidersBodySchema = z.infer<typeof updateTaskPrivateServiceProvidersBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskPrivateServiceProvidersController {
  constructor(
    private updateTaskPrivateServiceProviders: UpdateTaskPrivateServiceProvidersUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/service_providers")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body(new ZodValidationPipe(updateTaskPrivateServiceProvidersBodySchema)) data: UpdateTaskPrivateServiceProvidersBodySchema,
  ) {
    try {
      await this.validation.validateData(updateTaskPrivateServiceProvidersBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTaskPrivateServiceProviders.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      serviceProviderIds: data.service_provider_ids,
      taskId
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}