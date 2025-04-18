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
import { DraftStep } from "@/domain/work/enterprise";
import { TasksRepository } from "../../repositories";
interface UpdateTaskDraftStateUseCaseRequest {
  userId: string,
  taskId: string,
  state: DraftStep
}

type UpdateTaskDraftStateUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskDraftStateUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
  ) { }

  async execute({
    taskId,
    userId,
    state
  }: UpdateTaskDraftStateUseCaseRequest): Promise<UpdateTaskDraftStateUseCaseResponse> {
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

    if (task.state === "DRAFT")
      await this.tasksRepository.updateDraftStep(task.id.toString(), state);

    return right({
      message: "Task updated"
    });
  }
}
