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

import {
  TasksRepository,
  SubCategoriesRepository
} from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface UpdateTaskSubCategoryIdUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  subCategoryId: string
}

type UpdateTaskSubCategoryIdUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskSubCategoryIdUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private subCategoriesRepository: SubCategoriesRepository
  ) { }

  async execute({
    subCategoryId,
    taskId,
    userId,
    language
  }: UpdateTaskSubCategoryIdUseCaseRequest): Promise<UpdateTaskSubCategoryIdUseCaseResponse> {
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

    if (task.subCategoryId?.toString() === subCategoryId) return right({
      message: "Task updated"
    });

    const category = await this.subCategoriesRepository.findById({ id: subCategoryId, language });

    if (!category) {
      return left(new ResourceNotFoundError("Category not found"));
    }

    await this.tasksRepository.updateSubCategoryId(taskId, subCategoryId);
    await this.tasksRepository.updateSubSubCategoryId(taskId, "");

    if (task.state === "DRAFT" && task.draftStep === "SelectSubCategory")
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectService");

    return right({
      message: "Task updated"
    });
  }
}
