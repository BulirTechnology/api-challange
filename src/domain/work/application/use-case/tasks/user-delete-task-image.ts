import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import { TasksRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UserDeleteTaskImagesUseCaseRequest {
  language: LanguageSlug
  userId: string
  taskId: string
  fields: string[]
}

type UserDeleteTaskImagesUseCaseResponse = Either<
  InvalidAttachmentType,
  null
>

@Injectable()
export class UserDeleteTaskImagesUseCase {
  constructor(
    private taskRepository: TasksRepository
  ) { }

  async execute({
    taskId,
    fields
  }: UserDeleteTaskImagesUseCaseRequest): Promise<UserDeleteTaskImagesUseCaseResponse> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      return left(new ResourceNotFoundError("Task not found"));
    }

    if (fields.length === 0) return right(null);

    const images = {
      image1: task.image1,
      image2: task.image2,
      image3: task.image3,
      image4: task.image4,
      image5: task.image5,
      image6: task.image6,
    };

    for (const element of fields) {
      if (element === "image1") {
        images.image1 = null;
      }
      if (element === "image2") {
        images.image2 = null;
      }
      if (element === "image3") {
        images.image3 = null;
      }
      if (element === "image4") {
        images.image4 = null;
      }
      if (element === "image5") {
        images.image5 = null;
      }
      if (element === "image6") {
        images.image6 = null;
      }
    }

    const imageSet = new Set(Object.values(images));

    imageSet.delete(null);
    let items = 1;

    imageSet.forEach(async (value) => {
      await this.taskRepository.updateImage({
        field: "image" + (items++),
        taskId,
        url: value + "",
      });
    });

    for (let i = items; i <= 6; i++) {
      await this.taskRepository.updateImage({
        field: "image" + i,
        taskId,
        url: "",
      });
    }

    if (task.state === "DRAFT" && task.draftStep === "SelectImages")
      await this.taskRepository.updateDraftStep(task.id.toString(), "SelectStartDate");

    return right(null);
  }
}
