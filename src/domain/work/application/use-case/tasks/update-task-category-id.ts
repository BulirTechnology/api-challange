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
  CategoriesRepository
} from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskCategoryIdUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  categoryId: string
}

type UpdateTaskCategoryIdUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskCategoryIdUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private categoriesRepository: CategoriesRepository
  ) { }

  async execute({
    categoryId,
    taskId,
    userId,
    language
  }: UpdateTaskCategoryIdUseCaseRequest): Promise<UpdateTaskCategoryIdUseCaseResponse> {
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

    if (
      task.categoryId?.toString() &&
      task.categoryId?.toString() === categoryId
    ) return right({
      message: "Task updated"
    });

    const category = await this.categoriesRepository.findById({ id: categoryId, language });

    if (!category) {
      return left(new ResourceNotFoundError("Category not found"));
    }

    await this.tasksRepository.updateCategoryId(taskId, categoryId);
    await this.tasksRepository.updateSubCategoryId(taskId, "");
    await this.tasksRepository.updateSubSubCategoryId(taskId, "");

    if (task.state === "DRAFT" && task.draftStep === "SelectCategory")
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectSubCategory");

    return right({
      message: "Task updated"
    });
  }
}
