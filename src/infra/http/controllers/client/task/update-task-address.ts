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
import { UpdateTaskAddressUseCase } from "@/domain/work/application/use-case/tasks/update-task-address";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateTaskAddressBodySchema = z.object({
  address_id: z.string({
    invalid_type_error: "task.address_id.invalid_type_error",
    required_error: "task.address_id.invalid_type_error"
  }),
});

type UpdateTaskAddressBodySchema = z.infer<typeof updateTaskAddressBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskAddressController {
  constructor(
    private updateTaskAddress: UpdateTaskAddressUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/address")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: UpdateTaskAddressBodySchema,
  ) {
    try {
      await this.validation.validateData(updateTaskAddressBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTaskAddress.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      addressId: data.address_id,
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