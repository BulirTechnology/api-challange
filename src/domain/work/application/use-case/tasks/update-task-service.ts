import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";

import {
  TasksRepository,
  ServicesRepository
} from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface UpdateTaskServiceUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  serviceId: string
}

type UpdateTaskServiceUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskServiceUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private servicesRepository: ServicesRepository
  ) { }

  async execute({
    serviceId,
    taskId,
    userId,
    language
  }: UpdateTaskServiceUseCaseRequest): Promise<UpdateTaskServiceUseCaseResponse> {
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

    const service = await this.servicesRepository.findById({ id: serviceId, language });

    if (!service) {
      return left(new ResourceNotFoundError("Service not found"));
    }

    await this.tasksRepository.updateService(taskId, serviceId);

    if (task.state === "DRAFT" && task.draftStep === "SelectService")
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectAnswers");

    return right({
      message: "Task updated"
    });
  }
}
