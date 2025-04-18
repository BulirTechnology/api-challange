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

import { TasksRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskPrivateServiceProvidersUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  serviceProviderIds: string[]
}

type UpdateTaskPrivateServiceProvidersUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskPrivateServiceProvidersUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository
  ) { }

  async execute({
    taskId,
    userId,
    serviceProviderIds
  }: UpdateTaskPrivateServiceProvidersUseCaseRequest): Promise<UpdateTaskPrivateServiceProvidersUseCaseResponse> {
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

    await this.tasksRepository.deleteServiceProviders(taskId);
    await this.tasksRepository.addServiceProviders(taskId, serviceProviderIds);
    await this.tasksRepository.updateState(taskId, "ACTIVE");

    return right({
      message: "Task updated"
    });
  }
}
