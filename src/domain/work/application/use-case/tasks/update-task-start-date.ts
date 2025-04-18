import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository,

} from "@/domain/users/application/repositories/";

import { TasksRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskStartDateUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  startDate: Date
}

type UpdateTaskStartDateUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskStartDateUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
  ) { }

  async execute({
    startDate,
    taskId,
    userId
  }: UpdateTaskStartDateUseCaseRequest): Promise<UpdateTaskStartDateUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError("Client not found"));
    }

    const task = await this.tasksRepository.findById(taskId);

    if (!task) {
      return left(new ResourceNotFoundError("Task not found"));
    }

    if (task.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError("Task not found."));
    }

    await this.tasksRepository.updateStartDate(taskId, startDate);
    if (task.viewState === "PUBLIC")
      await this.tasksRepository.updateState(taskId, "ACTIVE");
    else
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectServiceProviders");

    return right({
      message: "Task updated"
    });
  }
}
