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
import { UpdateTaskQuestionUseCase } from "@/domain/work/application/use-case/tasks/update-task-question";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const updateTaskQuestionBodySchema = z.object({
  data: z.array(
    z.object({
      question_id: z.string({
        invalid_type_error: "task.question_id.invalid_type_error",
        required_error: "task.question_id.invalid_type_error"
      }),
      answers: z.array(z.string({
        invalid_type_error: "task.answers.invalid_type_error",
        required_error: "task.answers.invalid_type_error"
      }))
    })
  ),
});

type UpdateTaskQuestionBodySchema = z.infer<typeof updateTaskQuestionBodySchema>

@ApiTags("Tasks")
@Controller("/tasks")
@UseGuards(JwtAuthGuard)
export class UpdateTaskQuestionController {
  constructor(
    private updateTaskQuestion: UpdateTaskQuestionUseCase,
    private validation: ValidationService
  ) { }

  @Post("/:taskId/answer")
  async handle(
    @Headers() headers: Record<string, string>,
    @AuthenticatedUser() user: AuthPayload,
    @Param("taskId") taskId: string,
    @Body() data: UpdateTaskQuestionBodySchema,
  ) {
    try {
      await this.validation.validateData(updateTaskQuestionBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const result = await this.updateTaskQuestion.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      userId: user.sub,
      answerData: data.data.map(item => ({
        questionId: item.question_id,
        answers: item.answers
      })),
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