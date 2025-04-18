import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Booking } from "@/domain/work/enterprise/booking";
import { Booking as PrismaBooking } from "@prisma/client";

export type ExtendedPrismaBooking = PrismaBooking & {
  description: string
  image1: string
  image2: string
  image3: string
  image4: string
  image5: string
  image6: string
  conversationId: string
  serviceId: string
  title: string
  hasStartedDispute: boolean
  address: {
    id: string
    line1: string
    line2: string
    longitude: number
    latitude: number
    name: string
  }
  category: string,
  categoryId: string
  client: {
    id: string
    name: string
    profileUrl: string
    rating: number
  }
  service: string
  serviceProvider: {
    id: string
    name: string
    profileUrl: string
    rating: number
    isFavorite: boolean
  }
  clientSendReview: boolean
  serviceProviderSendReview: boolean
  subCategory: string
  subCategoryId: string
  subSubCategory: string
  subSubCategoryId: string
  clientReview: number
  serviceProviderReview: number
  answers?: {
    question: string,
    answer: string[],
    answerId: string[]
    questionId: string
  }[],
}

export class PrismaBookingMapper {
  static toDomain(
    info: ExtendedPrismaBooking
  ): Booking {
    return Booking.create({
      clientId: new UniqueEntityID(info.clientId),
      description: info.description,
      finalPrice: info.finalPrice,
      image1: info.image1,
      image2: info.image2,
      image3: info.image3,
      image4: info.image4,
      image5: info.image5,
      image6: info.image6,
      conversationId: info.conversationId,
      completedAt: info.completedAt,
      totalTryingToFinish: info.totalTryingToFinish,
      totalTryingToStart: info.totalTryingToStart,
      serviceId: new UniqueEntityID(info.serviceId),
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
      state: info.state,
      title: info.title,
      workState: info.workState,
      requestWorkState: info.requestWorkState,
      clientSendReview: info.clientSendReview,
      serviceProviderSendReview: info.serviceProviderSendReview,
      workDate: info.workDate,
      hasStartedDispute: info.hasStartedDispute,
      clientReview: info.clientReview,
      serviceProviderReview: info.serviceProviderReview,
      address: {
        id: new UniqueEntityID(info.address.id),
        latitude: info.address.latitude,
        line1: info.address.line1,
        line2: info.address.line2,
        longitude: info.address.longitude
      },
      answers: info.answers,
      category: info.category,
      categoryId: new UniqueEntityID(info.categoryId),
      client: {
        id: new UniqueEntityID(info.client.id),
        name: info.client.name,
        profileUrl: info.client.profileUrl,
        rating: info.client.rating
      },
      service: info.service,
      serviceProvider: {
        id: new UniqueEntityID(info.serviceProvider.id),
        name: info.serviceProvider.name,
        profileUrl: info.serviceProvider.profileUrl,
        rating: info.serviceProvider.rating,
        isFavorite: info.serviceProvider.isFavorite
      },
      subCategory: info.subCategory,
      subCategoryId: new UniqueEntityID(info.subCategoryId),
      subSubCategory: info.subSubCategory,
      subSubCategoryId: new UniqueEntityID(info.subSubCategoryId),
      jobId: new UniqueEntityID(info.jobId),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(booking: Booking): PrismaBooking {
    return {
      id: booking.id.toString(),
      jobId: booking.jobId.toString(),
      serviceProviderId: booking.serviceProviderId.toString(),
      completedAt: booking.completedAt ? booking.completedAt : new Date(),
      totalTryingToFinish: booking.totalTryingToFinish,
      totalTryingToStart: booking.totalTryingToStart,
      state: booking.state,
      clientId: booking.clientId.toString(),
      finalPrice: booking.finalPrice,
      requestWorkState: booking.requestWorkState,
      workDate: booking.workDate,
      workState: booking.workState,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt ? booking.updatedAt : new Date(),
    };
  }
}