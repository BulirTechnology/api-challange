import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Task, ViewState } from "../../../enterprise";
import { TasksRepository } from "../../repositories";
import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskBaseInfoUseCaseRequest {
  language: LanguageSlug
  userId: string
  viewState: ViewState
  title: string
  description: string
  price: number
  taskId: string
}

type UpdateTaskBaseInfoUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    task: Task
  }
>

@Injectable()
export class UpdateTaskBaseInfoUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository
  ) { }

  async execute({
    userId,
    title,
    description,
    price,
    viewState,
    taskId
  }: UpdateTaskBaseInfoUseCaseRequest): Promise<UpdateTaskBaseInfoUseCaseResponse> {
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

    if (task.clientId.toString() !== client.id.toString()) {
      return left(new ResourceNotFoundError("Client task not found"));
    }

    const taskToUpdate = Task.create({
      title,
      description,
      price,
      viewState,
      serviceId: task.serviceId,
      addressId: task.addressId,
      startDate: task.startDate,
      clientId: task.clientId,
      state: task.state,
      image1: task.image1,
      image2: task.image2,
      image3: task.image3,
      image4: task.image4,
      image5: task.image5,
      image6: task.image6,
      serviceProviderIds: [],
      serviceProviders: [],
      draftStep: "SelectBaseInfo"
    }, task.id);

    await this.tasksRepository.updateBaseInfo(taskToUpdate);

    return right({
      task: taskToUpdate,
    });
  }
}
