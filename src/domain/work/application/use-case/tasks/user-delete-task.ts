import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories/";

import { TasksRepository } from "../../repositories/task-repository";
import { LanguageSlug } from "@/domain/users/enterprise";
interface UserDeleteTaskUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string
}

type UserDeleteTaskUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UserDeleteTaskUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository
  ) { }

  async execute({
    taskId,
    userId
  }: UserDeleteTaskUseCaseRequest): Promise<UserDeleteTaskUseCaseResponse> {
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

    await this.tasksRepository.updateState(taskId, "INACTIVE");

    return right({
      message: "Task updated"
    });
  }
}
