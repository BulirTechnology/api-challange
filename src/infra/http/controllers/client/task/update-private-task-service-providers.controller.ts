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
import { ResourceNotFoundError } from "@/core/errors";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { UpdatePrivateTaskServiceProvidersUseCase } from "@/domain/work/application/use-case/tasks/update-private-task-service-providers";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updatePrivateTaskServiceProvidersBodySchema = z.object({
  services_providers: z.array(z.string({
    invalid_type_error: "task.service_provider_ids.invalid_type_error",
    required_error: "task.service_provider_ids.invalid_type_error"
  })),
});

type UpdatePrivateTaskServiceProvidersBodySchema = z.infer<typeof updatePrivateTaskServiceProvidersBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdatePrivateTaskServiceProvidersController {
  constructor(
    private updatePrivateTaskServiceProviders: UpdatePrivateTaskServiceProvidersUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/service-providers")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: UpdatePrivateTaskServiceProvidersBodySchema,
  ) {
    try {
      await this.validation.validateData(updatePrivateTaskServiceProvidersBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updatePrivateTaskServiceProviders.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      taskId,
      serviceProviders: data.services_providers,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }
  }
}