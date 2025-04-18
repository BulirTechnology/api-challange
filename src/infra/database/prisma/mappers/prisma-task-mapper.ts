import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { Task } from "@/domain/work/enterprise/task";
import {
  Prisma,
  Task as PrismaTask
} from "@prisma/client";

export class PrismaTaskMapper {
  static toDomain(info: PrismaTask & {
    serviceProviderIds: string[]
    serviceProviders: {
      id: string,
      firstName: string
      lastName: string
      rating: number
      userId: string
      isFavorite: boolean
      profileImage: string
    }[]
    answers?: {
      question: string,
      answer: string[],
      answerId: string[]
      questionId: string
    }[],
    category?: {
      id: string,
      title: string
    }
    subCategory?: {
      id: string,
      title: string
    }
    subSubCategory?: {
      id: string,
      title: string
    }
    service?: {
      id: string,
      title: string
    },
    address?: {
      id: string
      name: string
      isPrimary: boolean
      latitude: number,
      line1: string,
      line2: string,
      longitude: number
    },
  }): Task {
    return Task.create({
      title: info.title,
      description: info.description,
      addressId: info.addressId ? new UniqueEntityID(info.addressId) : null,
      serviceId: info.serviceId ? new UniqueEntityID(info.serviceId) : null,
      startDate: info.startDate,
      state: info.state,
      price: info.price.toNumber(),
      clientId: new UniqueEntityID(info.clientId),
      image1: info.image1,
      image2: info.image2,
      image3: info.image3,
      image4: info.image4,
      image5: info.image5,
      image6: info.image6,
      address: info.address,
      answers: info.answers,
      category: info.category?.title ?? "",
      categoryId: new UniqueEntityID(info.categoryId+""),
      service: info.service?.title ?? "",
      subCategory: info.subCategory?.title,
      subCategoryId: new UniqueEntityID(info.subCategoryId+""),
      subSubCategory: info.subSubCategory?.title ?? "",
      subSubCategoryId: new UniqueEntityID(info.subSubCategory?.id),
      viewState: info.viewState,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      serviceProviderIds: info.serviceProviderIds,
      serviceProviders: info.serviceProviders,
      draftStep: info.draftStep
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(task: Task): PrismaTask {
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      price: new Prisma.Decimal(task.price),
      startDate: task.startDate,
      clientId: task.clientId.toString(),
      state: task.state,
      addressId: task.addressId ? task.addressId.toString() : null,
      serviceId: task.serviceId ? task.serviceId.toString() : null,
      image1: task.image1,
      image2: task.image2,
      image3: task.image3,
      image4: task.image4,
      image5: task.image5,
      image6: task.image6,
      categoryId: task.categoryId ? task.categoryId?.toString() : "",
      subCategoryId: task.subCategoryId ? task.subCategoryId?.toString() : "",
      subSubCategoryId: task.subSubCategoryId ? task.subSubCategoryId?.toString() : "",
      draftStep: task.draftStep,
      viewState: task.viewState,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt ? task.updatedAt : new Date(),
    };
  }
}