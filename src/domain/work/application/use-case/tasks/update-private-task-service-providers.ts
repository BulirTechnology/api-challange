import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { PrivateTask } from "@/domain/work/enterprise";

import {
  TasksRepository,
  PrivateTasksRepository
} from "../../repositories";
import { MAX_SP_IN_PRIVATE_TASK } from "./add-task";
interface UpdatePrivateTaskServiceProvidersUseCaseRequest {
  language: "en" | "pt"
  userId: string,
  taskId: string,
  serviceProviders: string[]
}

type UpdatePrivateTaskServiceProvidersUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdatePrivateTaskServiceProvidersUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private privateTasksRepository: PrivateTasksRepository
  ) { }

  async execute({
    serviceProviders,
    taskId,
    userId
  }: UpdatePrivateTaskServiceProvidersUseCaseRequest): Promise<UpdatePrivateTaskServiceProvidersUseCaseResponse> {
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

    for (let i = 0; i < serviceProviders.length; i++) {
      if (i + 1 > MAX_SP_IN_PRIVATE_TASK) break;

      const privateTask = PrivateTask.create({
        serviceProviderId: serviceProviders[i],
        taskId
      });

      await this.privateTasksRepository.create(privateTask);
    }

    return right({
      message: "Task updated"
    });
  }
}
