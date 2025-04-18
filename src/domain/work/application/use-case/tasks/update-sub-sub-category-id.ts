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
  SubSubCategoriesRepository
} from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface UpdateTaskSubSubCategoryIdUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  subSubCategoryId: string
}

type UpdateTaskSubSubCategoryIdUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskSubSubCategoryIdUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private subSubCategoriesRepository: SubSubCategoriesRepository
  ) { }

  async execute({
    subSubCategoryId,
    taskId,
    userId,
    language
  }: UpdateTaskSubSubCategoryIdUseCaseRequest): Promise<UpdateTaskSubSubCategoryIdUseCaseResponse> {
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

    const category = await this.subSubCategoriesRepository.findById({ id: subSubCategoryId, language });

    if (!category) {
      return left(new ResourceNotFoundError("Category not found"));
    }

    await this.tasksRepository.updateSubSubCategoryId(taskId, subSubCategoryId);

    if (task.state === "DRAFT")
      await this.tasksRepository.updateDraftStep(task.id.toString(), task.viewState === "PRIVATE" ? "SelectServiceProviders" : "SelectImages");

    return right({
      message: "Task updated"
    });
  }
}
