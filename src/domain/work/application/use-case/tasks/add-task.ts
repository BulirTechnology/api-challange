import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  Task,
  ViewState,
  PrivateTask
} from "../../../enterprise";

import {
  TasksRepository,
  PrivateTasksRepository
} from "../../repositories";
import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
interface AddTaskUseCaseRequest {
  language: LanguageSlug
  userId: string
  viewState: ViewState
  title: string
  description: string
  price: number
  categoryId: string | undefined
  subCategoryId: string | undefined
  subSubCategoryId: string | undefined
  serviceId: string | undefined
  serviceProviderIds: string[] | undefined,
}

type AddTaskUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    task: Task
  }
>

export const MAX_SP_IN_PRIVATE_TASK = 3

@Injectable()
export class AddTaskUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private privateTasksRepository: PrivateTasksRepository
  ) { }

  async execute({
    userId,
    title,
    description,
    price,
    viewState,
    serviceProviderIds,
    serviceId,
    categoryId,
    subCategoryId,
    subSubCategoryId
  }: AddTaskUseCaseRequest): Promise<AddTaskUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError("Client not found"));
    }

    const task = Task.create({
      title,
      description,
      price,
      viewState,
      serviceId: null,
      addressId: null,
      startDate: new Date(),
      clientId: client.id,
      state: "DRAFT",
      image1: null,
      image2: null,
      image3: null,
      image4: null,
      image5: null,
      image6: null,
      serviceProviderIds: [],
      serviceProviders: [],
      draftStep: "SelectBaseInfo"
    });

    const taskCreated = await this.tasksRepository.create(task);

    if (categoryId) {
      await this.tasksRepository.updateCategoryId(taskCreated.id.toString(), categoryId);
    }

    if (subCategoryId) {
      await this.tasksRepository.updateSubCategoryId(taskCreated.id.toString(), subCategoryId);
    }

    if (subSubCategoryId) {
      await this.tasksRepository.updateSubSubCategoryId(taskCreated.id.toString(), subSubCategoryId);
    }

    if (serviceId) {
      await this.tasksRepository.updateService(taskCreated.id.toString(), serviceId);
    }

    if (serviceProviderIds) {
      for (let i = 0; i < serviceProviderIds.length; i++) {
        if (i + 1 > MAX_SP_IN_PRIVATE_TASK) break;

        const privateTask = PrivateTask.create({
          serviceProviderId: serviceProviderIds[i],
          taskId: taskCreated.id.toString()
        });

        await this.privateTasksRepository.create(privateTask);
      }
    }

    if (taskCreated.state === "DRAFT")
      await this.tasksRepository.updateDraftStep(taskCreated.id.toString(), "SelectAddress");

    return right({
      task: taskCreated,
    });
  }
}
