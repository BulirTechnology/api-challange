import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Job } from "@/domain/work/enterprise/job";
import { QuotationStatus } from "@/domain/work/enterprise/quotation";
import {
  Prisma,
  Job as PrismaJob
} from "@prisma/client";

export class PrismaJobMapper {
  static toDomain(info: PrismaJob & {
    answers?: {
      question: string,
      answer: string[],
      answerId: string[]
      questionId: string
    }[],
    quotations: {
      id: string
      serviceProviderName: string
      readByClient: boolean
      serviceProviderId: string
      profileUrl: string
      rating: number
      budget: number
      status: QuotationStatus
      date: Date
      createdAt: Date
      description: string
      serviceProviderIsFavorite: boolean
    }[]
    address: {
      name: string
      latitude: number,
      line1: string,
      line2: string,
      longitude: number
    },
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
    }
  }): Job {
    return Job.create({
      title: info.title,
      description: info.description,
      addressId: new UniqueEntityID(info.addressId),
      serviceId: new UniqueEntityID(info.serviceId),
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
      viewState: info.viewState,
      address: info.address,
      answers: info.answers,
      quotations: info.quotations,
      category: info.category?.title ?? "",
      categoryId: new UniqueEntityID(info.category?.id),
      service: info.service?.title ?? "",
      subCategory: info.subCategory?.title,
      subCategoryId: new UniqueEntityID(info.subCategory?.id),
      subSubCategory: info.subSubCategory?.title ?? "",
      subSubCategoryId: new UniqueEntityID(info.subSubCategory?.id),
      quotationState: info.quotationState,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(job: Job): PrismaJob {
    return {
      id: job.id.toString(),
      title: job.title,
      description: job.description,
      price: new Prisma.Decimal(job.price),
      startDate: job.startDate,
      clientId: job.clientId.toString(),
      state: job.state,
      viewState: job.viewState,
      addressId: job.addressId.toString(),
      serviceId: job.serviceId.toString(),
      image1: job.image1,
      image2: job.image2,
      image3: job.image3,
      image4: job.image4,
      image5: job.image5,
      image6: job.image6,
      quotationState: job.quotationState,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelDescription: job.cancelDescription + "",
      cancelReasonId: job.cancelReasonId?.toString() + ""
    };
  }
}