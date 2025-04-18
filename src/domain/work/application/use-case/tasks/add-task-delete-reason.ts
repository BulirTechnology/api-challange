import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidResourceError
} from "@/core/errors";

import { TaskDeleteReasonRepository } from "../../repositories";
import { TaskDeleteReason } from "../../../enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";

interface AddTaskDeleteReasonUseCaseRequest {
  language: LanguageSlug
  value: string
}

type AddTaskDeleteReasonUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    taskDeleteReason: TaskDeleteReason
  }
>

@Injectable()
export class AddTaskDeleteReasonUseCase {
  constructor(
    private taskDeleteReasonRepository: TaskDeleteReasonRepository
  ) { }

  async execute({
    value
  }: AddTaskDeleteReasonUseCaseRequest): Promise<AddTaskDeleteReasonUseCaseResponse> {
    const deleteReason = await this.taskDeleteReasonRepository.findByTitle(value)

    if (deleteReason) {
      return left(new InvalidResourceError("Already exist an task delete reason with this name"))
    }

    const task = TaskDeleteReason.create({
      value
    });

    const created = await this.taskDeleteReasonRepository.create(task);

    return right({
      taskDeleteReason: created
    });
  }
}
