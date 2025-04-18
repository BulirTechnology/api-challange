import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import { Uploader } from "@/core/storage/uploader";
import { TasksRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskImagesUseCaseRequest {
  language: LanguageSlug
  taskId: string
  imageUrls: {
    url: string
  }[]
}

type UpdateTaskImagesUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string,
    listImages: {
      image1?: string
      image2?: string
      image3?: string
      image4?: string
      image5?: string
      image6?: string
    }
  }
>

@Injectable()
export class UpdateTaskImagesUseCase {
  constructor(
    private uploader: Uploader,
    private taskRepository: TasksRepository
  ) { }

  async execute({
    imageUrls,
    taskId
  }: UpdateTaskImagesUseCaseRequest): Promise<UpdateTaskImagesUseCaseResponse> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      return left(new ResourceNotFoundError("Task not found"));
    }

    for (let i = 0; i < imageUrls.length; i++) {
      await this.taskRepository.updateImage({
        field: "image" + (i + 1),
        taskId,
        url: imageUrls[i].url,
      });
    }

    if (task.state === "DRAFT")
      await this.taskRepository.updateDraftStep(task.id.toString(), "SelectStartDate");

    const updatedTask = await this.taskRepository.findById(taskId);

    return right({
      message: "File upload with success",
      listImages: {
        image1: updatedTask?.image1 ?? undefined,
        image2: updatedTask?.image2 ?? undefined,
        image3: updatedTask?.image3 ?? undefined,
        image4: updatedTask?.image4 ?? undefined,
        image5: updatedTask?.image5 ?? undefined,
        image6: updatedTask?.image6 ?? undefined,
      }
    });
  }
}
