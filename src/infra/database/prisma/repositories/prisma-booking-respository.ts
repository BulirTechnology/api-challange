import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { BookingsRepository } from "@/domain/work/application/repositories/booking-repository";
import { Booking, BookingRequestWorkState, BookingState } from "@/domain/work/enterprise/booking";
import { ExtendedPrismaBooking, PrismaBookingMapper } from "../mappers/prisma-booking-mapper";
import { Pagination } from "@/core/repositories/pagination-params";
import {
  Prisma,
  Booking as PrismaBooking,
  Job,
  Client,
  User,
  Services,
  Address,
  Conversation,
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";
import { AccountType } from "@/domain/users/enterprise/user";
import { PrismaHelpersRatingAndFavoriteRepository } from "../prisma-common-helpers.service";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

type BookingProp = PrismaBooking & {
  job: Job & {
    client: Client & {
      user: User
    }
    service: Services,
    address: Address
  }
  conversation: Conversation
}

@Injectable()
export class PrismaBookingsRepository implements BookingsRepository {
  constructor(
    private helpers: PrismaHelpersRatingAndFavoriteRepository,
    private prisma: PrismaService
  ) { }

  async findByState(params: { state: BookingState }): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany(({
      where: {
        state: params.state,
        completedAt: new Date()
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,
          }
        }
      }
    }));

    const result: ExtendedPrismaBooking[] = [];
    for (const element of bookings) {
      const item = element;

      const subSubCategory = await this.prisma.subSubCategory.findFirst({
        where: {
          id: item.job.service.subSubCategoryId
        }
      });
      const subCategory = await this.prisma.subCategory.findFirst({
        where: {
          id: subSubCategory?.subCategoryId
        }
      });
      const category = await this.prisma.category.findFirst({
        where: {
          id: subCategory?.categoryId
        }
      });
      const answers = await this.prisma.answerJob.findMany({
        where: {
          jobId: item.jobId
        },
        include: {
          question: true
        }
      });
      const answersResult: {
        question: string,
        answer: string[],
        answerId: string[]
        questionId: string
      }[] = [];

      for (const ans of answers) {
        let exist = false;

        for (const ansResult of answersResult) {
          if (
            ansResult.questionId &&
            ans.questionId &&
            ansResult.questionId === ans.questionId) {
            ansResult.answerId.push(ans.value);
            ansResult.answer.push(ans.value);
            exist = true;
          }
        }

        const question = await this.prisma.question.findFirst({
          where: {
            id: ans.questionId
          }
        });

        const option = await this.prisma.option.findFirst({
          where: {
            questionId: ans.questionId
          }
        });

        if (!exist) {
          answersResult.push({
            answer: [question && question.type !== "SIMPLE" && option ? option.value : ans.value],
            answerId: [ans.value],
            question: ans.question.title,
            questionId: ans.questionId
          });
        }
      }

      const sp = await this.prisma.serviceProvider.findFirst({
        where: {
          id: item.serviceProviderId
        },
        include: {
          user: true
        }
      });

      const clientRating = await this.helpers.getRating(item.job.client.userId);
      const spRating = await this.helpers.getRating(sp?.userId + "");

      const clientSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: sp?.userId + "",
          userId: item.job.client.userId,
        }
      });
      const clientReview = await this.prisma.reviewAndRating.findFirst({
        where: {
          bookingId: item.id,
          reviewerId: sp?.userId + "",
          userId: item.job.client.userId,
        }
      });
      const serviceProviderSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: item.job.client.userId,
          userId: sp?.userId + "",
        }
      });
      const serviceProviderReview = await this.prisma.reviewAndRating.findFirst({
        where: {
          bookingId: item.id,
          reviewerId: item.job.client.userId,
          userId: sp?.userId + "",
        }
      });

      const hasStartedDispute = await this.prisma.fileDispute.count({
        where: {
          bookingId: item.id
        }
      }) > 0;

      const booking: ExtendedPrismaBooking = {
        hasStartedDispute,
        clientReview: clientReview?.stars ?? 0,
        serviceProviderReview: serviceProviderReview?.stars ?? 0,
        clientSendReview: clientSendReview > 0,
        serviceProviderSendReview: serviceProviderSendReview > 0,
        clientId: item.clientId,
        createdAt: item.createdAt,
        finalPrice: item.finalPrice,
        conversationId: item.conversation?.id + '',
        completedAt: item.completedAt,
        id: item.id,
        jobId: item.jobId,
        totalTryingToFinish: item.totalTryingToFinish,
        totalTryingToStart: item.totalTryingToStart,
        requestWorkState: item.requestWorkState,
        serviceProviderId: item.serviceProviderId,
        state: item.state,
        updatedAt: item.updatedAt,
        workDate: item.workDate,
        workState: item.workState,
        address: {
          id: item.job.address.id,
          latitude: item.job.address.latitude.toNumber(),
          line1: item.job.address.line1,
          line2: item.job.address.line2,
          longitude: item.job.address.longitude.toNumber(),
          name: item.job.address.name
        },
        category: category?.title + "",
        categoryId: category?.id + "",
        client: {
          id: item.job.client.id,
          name: item.job.client.firstName + " " + item.job.client.lastName,
          profileUrl: item.job.client.user.profileUrl,
          rating: clientRating
        },
        description: item.job.description,
        image1: item.job.image1,
        image2: item.job.image2 + "",
        image3: item.job.image3 + "",
        image4: item.job.image4 + "",
        image5: item.job.image5 + "",
        image6: item.job.image6 + "",
        service: item.job.service.title,
        serviceId: item.job.serviceId,
        serviceProvider: {
          id: sp?.id + "",
          name: sp?.firstName + " " + sp?.lastName,
          profileUrl: sp?.user.profileUrl + "",
          rating: spRating,
          isFavorite: await this.helpers.isFavorite({
            clientId: item.job.clientId,
            serviceProviderId: `${sp?.id}`
          })
        },
        subCategory: subCategory?.title + "",
        subCategoryId: subSubCategory?.subCategoryId + "",
        subSubCategory: subSubCategory?.title + "",
        subSubCategoryId: item.job.service.subSubCategoryId,
        title: item.job.title,
        answers: answersResult
      };

      result.push(booking);
    }

    return result.map(PrismaBookingMapper.toDomain)
  }

  private async count(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.count({
      where
    })
  }

  async getWorkRequestCountsByState(params: { parentId: string; accountType: AccountType }): Promise<{ active: number; completed: number; expired: number; inDispute: number; pending: number; }> {
    const totalActive = await this.count({
      clientId: params.accountType === "Client" ? params.parentId : {},
      serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
      requestWorkState: 'RUNNING'
    })
    const totalCompleted = await this.count({
      clientId: params.accountType === "Client" ? params.parentId : {},
      serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
      requestWorkState: 'COMPLETED'
    })
    const totalExpired = await this.count({
      clientId: params.accountType === "Client" ? params.parentId : {},
      serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
      state: 'EXPIRED'
    })
    const totalDispute = await this.count({
      clientId: params.accountType === "Client" ? params.parentId : {},
      serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
      state: 'DISPUTE'
    })
    const totalPending = await this.count({
      clientId: params.accountType === "Client" ? params.parentId : {},
      serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
      state: 'PENDING'
    })

    return {
      active: totalActive,
      completed: totalCompleted,
      expired: totalExpired,
      inDispute: totalDispute,
      pending: totalPending
    }
  }

  async getTotalRequestBookingByState(params: {
    accountType: AccountType,
    parentId: string,
    requestWorkState: BookingRequestWorkState
  }): Promise<number> {
    const total = await this.prisma.booking.count({
      where: {
        clientId: params.accountType === "Client" ? params.parentId : {},
        serviceProviderId: params.accountType === "ServiceProvider" ? params.parentId : {},
        requestWorkState: params.requestWorkState
      }
    })

    return total
  }

  async countPostByState(params: { accountType: AccountType; state: BookingState | "ALL"; responseId: string }): Promise<number> {
    const where: Prisma.BookingWhereInput = {};

    if (params.accountType === "Client") {
      where.clientId = params.responseId;
    }
    if (params.accountType === "ServiceProvider")
      where.serviceProviderId = params.responseId;
    if (params.state != "ALL")
      where.state = params.state;

    const total = await this.prisma.booking.count({
      where
    });

    return total;
  }
  async findItemStartInNextDate(params: {
    currentTime: Date,
    secondsFromNow: Date,
    perPage?: number
  }): Promise<Pagination<Booking>> {
    const response = await this.paginate({
      where: {
        workDate: {
          gte: params.currentTime,
          lt: params.secondsFromNow,
        },
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,

          }
        }
      }
    });

    return {
      data: response.data.map(item => PrismaBookingMapper.toDomain({
        hasStartedDispute: false,
        clientSendReview: false,
        clientReview: 0,
        serviceProviderReview: 0,
        serviceProviderSendReview: false,
        completedAt: item.completedAt,
        clientId: item.clientId,
        createdAt: item.createdAt,
        finalPrice: item.finalPrice,
        id: item.id,
        conversationId: item.conversation.id,
        totalTryingToFinish: item.totalTryingToFinish,
        totalTryingToStart: item.totalTryingToStart,
        jobId: item.jobId,
        requestWorkState: item.requestWorkState,
        serviceProviderId: item.serviceProviderId,
        state: item.state,
        updatedAt: item.updatedAt,
        workDate: item.workDate,
        workState: item.workState,
        address: {
          id: item.job.address.id,
          latitude: item.job.address.latitude.toNumber(),
          line1: item.job.address.line1,
          line2: item.job.address.line2,
          longitude: item.job.address.longitude.toNumber(),
          name: item.job.address.name
        },
        category: "",
        categoryId: "",
        client: {
          id: item.job.client.id,
          name: item.job.client.firstName + " " + item.job.client.lastName,
          profileUrl: item.job.client.user.profileUrl,
          rating: 0
        },
        description: item.job.description,
        image1: item.job.image1,
        image2: item.job.image2 + "",
        image3: item.job.image3 + "",
        image4: item.job.image4 + "",
        image5: item.job.image5 + "",
        image6: item.job.image6 + "",
        service: item.job.service.title,
        serviceId: item.job.serviceId,
        serviceProvider: {
          id: "",
          name: "",
          profileUrl: "",
          rating: 0,
          isFavorite: false
        },
        subCategory: "",
        subCategoryId: "",
        subSubCategory: "",
        subSubCategoryId: item.job.service.subSubCategoryId,
        title: item.job.title,
        answers: []
      })),
      meta: response.meta
    };
  }
  async findExpiredByDate(params: {
    startDate: Date,
    perPage?: number
  }): Promise<Pagination<Booking>> {
    const response = await this.paginate({
      where: {
        workDate: {
          lte: params.startDate
        },
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,
          }
        }
      }
    });

    return {
      data: response.data.map(item => PrismaBookingMapper.toDomain({
        hasStartedDispute: false,
        clientSendReview: false,
        clientReview: 0,
        serviceProviderReview: 0,
        serviceProviderSendReview: false,
        completedAt: item.completedAt,
        clientId: item.clientId,
        createdAt: item.createdAt,
        finalPrice: item.finalPrice,
        id: item.id,
        conversationId: item.conversation.id,
        totalTryingToFinish: item.totalTryingToFinish,
        totalTryingToStart: item.totalTryingToStart,
        jobId: item.jobId,
        requestWorkState: item.requestWorkState,
        serviceProviderId: item.serviceProviderId,
        state: item.state,
        updatedAt: item.updatedAt,
        workDate: item.workDate,
        workState: item.workState,
        address: {
          id: item.job.address.id,
          latitude: item.job.address.latitude.toNumber(),
          line1: item.job.address.line1,
          line2: item.job.address.line2,
          longitude: item.job.address.longitude.toNumber(),
          name: item.job.address.name
        },
        category: "",
        categoryId: "",
        client: {
          id: item.job.client.id,
          name: item.job.client.firstName + " " + item.job.client.lastName,
          profileUrl: item.job.client.user.profileUrl,
          rating: 0
        },
        description: item.job.description,
        image1: item.job.image1,
        image2: item.job.image2 + "",
        image3: item.job.image3 + "",
        image4: item.job.image4 + "",
        image5: item.job.image5 + "",
        image6: item.job.image6 + "",
        service: item.job.service.title,
        serviceId: item.job.serviceId,
        serviceProvider: {
          id: "",
          name: "",
          profileUrl: "",
          rating: 0,
          isFavorite: false
        },
        subCategory: "",
        subCategoryId: "",
        subSubCategory: "",
        subSubCategoryId: item.job.service.subSubCategoryId,
        title: item.job.title,
        answers: []
      })),
      meta: response.meta
    };
  }
  async findClientBooking(params: {
    clientId: string; status: BookingState; page: number;
    perPage?: number
  }): Promise<Pagination<Booking>> {
    const bookings = await this.paginate(({
      where: {
        clientId: params.clientId,
        state: params.status ? params.status : {},
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,
          }
        }
      }
    }));

    const result: ExtendedPrismaBooking[] = [];
    for (const element of bookings.data) {
      const item = element;

      const subSubCategory = await this.prisma.subSubCategory.findFirst({
        where: {
          id: item.job.service.subSubCategoryId
        }
      });
      const subCategory = await this.prisma.subCategory.findFirst({
        where: {
          id: subSubCategory?.subCategoryId
        }
      });
      const category = await this.prisma.category.findFirst({
        where: {
          id: subCategory?.categoryId
        }
      });
      const answers = await this.prisma.answerJob.findMany({
        where: {
          jobId: item.jobId
        },
        include: {
          question: true
        }
      });
      const answersResult: {
        question: string,
        answer: string[],
        answerId: string[]
        questionId: string
      }[] = [];

      for (const ans of answers) {
        let exist = false;

        for (const ansResult of answersResult) {
          if (
            ansResult.questionId &&
            ans.questionId &&
            ansResult.questionId === ans.questionId) {
            ansResult.answerId.push(ans.value);
            ansResult.answer.push(ans.value);
            exist = true;
          }
        }

        const question = await this.prisma.question.findFirst({
          where: {
            id: ans.questionId
          }
        });

        const option = await this.prisma.option.findFirst({
          where: {
            questionId: ans.questionId
          }
        });

        if (!exist) {
          answersResult.push({
            answer: [question && question.type !== "SIMPLE" && option ? option.value : ans.value],
            answerId: [ans.value],
            question: ans.question.title,
            questionId: ans.questionId
          });
        }
      }

      const sp = await this.prisma.serviceProvider.findFirst({
        where: {
          id: item.serviceProviderId
        },
        include: {
          user: true
        }
      });

      const clientRating = await this.helpers.getRating(item.job.client.userId);
      const spRating = await this.helpers.getRating(sp?.userId + "");

      const clientSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: sp?.userId + "",
          userId: item.job.client.userId,
        }
      });
      const serviceProviderSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: item.job.client.userId,
          userId: sp?.userId + "",
        }
      });

      const hasStartedDispute = await this.prisma.fileDispute.count({
        where: {
          bookingId: item.id
        }
      }) > 0;

      const booking: ExtendedPrismaBooking = {
        hasStartedDispute,
        completedAt: item.completedAt,
        clientReview: 0,
        serviceProviderReview: 0,
        clientSendReview: clientSendReview > 0,
        serviceProviderSendReview: serviceProviderSendReview > 0,
        clientId: item.clientId,
        createdAt: item.createdAt,
        finalPrice: item.finalPrice,
        conversationId: item.conversation?.id,
        id: item.id,
        jobId: item.jobId,
        totalTryingToFinish: item.totalTryingToFinish,
        totalTryingToStart: item.totalTryingToStart,
        requestWorkState: item.requestWorkState,
        serviceProviderId: item.serviceProviderId,
        state: item.state,
        updatedAt: item.updatedAt,
        workDate: item.workDate,
        workState: item.workState,
        address: {
          id: item.job.address.id,
          latitude: item.job.address.latitude.toNumber(),
          line1: item.job.address.line1,
          line2: item.job.address.line2,
          longitude: item.job.address.longitude.toNumber(),
          name: item.job.address.name
        },
        category: category?.title + "",
        categoryId: category?.id + "",
        client: {
          id: item.job.client.id,
          name: item.job.client.firstName + " " + item.job.client.lastName,
          profileUrl: item.job.client.user.profileUrl,
          rating: clientRating
        },
        description: item.job.description,
        image1: item.job.image1,
        image2: item.job.image2 + "",
        image3: item.job.image3 + "",
        image4: item.job.image4 + "",
        image5: item.job.image5 + "",
        image6: item.job.image6 + "",
        service: item.job.service.title,
        serviceId: item.job.serviceId,
        serviceProvider: {
          id: sp?.id + "",
          name: sp?.firstName + " " + sp?.lastName,
          profileUrl: sp?.user.profileUrl + "",
          rating: spRating,
          isFavorite: await this.helpers.isFavorite({
            clientId: item.job.clientId,
            serviceProviderId: `${sp?.id}`
          })
        },
        subCategory: subCategory?.title + "",
        subCategoryId: subSubCategory?.subCategoryId + "",
        subSubCategory: subSubCategory?.title + "",
        subSubCategoryId: item.job.service.subSubCategoryId,
        title: item.job.title,
        answers: answersResult
      };

      result.push(booking);
    }

    return {
      data: result.map(PrismaBookingMapper.toDomain),
      meta: bookings.meta
    };
  }
  async findServiceProviderBooking(params: {
    serviceProviderId: string; status: BookingState; page: number;
    perPage?: number
  }): Promise<Pagination<Booking>> {
    const bookings = await this.paginate(({
      where: {
        state: params.status,
        serviceProviderId: params.serviceProviderId
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,
          }
        }
      }
    }));

    const result: ExtendedPrismaBooking[] = [];
    for (const element of bookings.data) {
      const item = element;

      const subSubCategory = await this.prisma.subSubCategory.findFirst({
        where: {
          id: item.job.service.subSubCategoryId
        }
      });
      const subCategory = await this.prisma.subCategory.findFirst({
        where: {
          id: subSubCategory?.subCategoryId
        }
      });
      const category = await this.prisma.category.findFirst({
        where: {
          id: subCategory?.categoryId
        }
      });
      const answers = await this.prisma.answerJob.findMany({
        where: {
          jobId: item.jobId
        },
        include: {
          question: true
        }
      });
      const answersResult: {
        question: string,
        answer: string[],
        answerId: string[]
        questionId: string
      }[] = [];

      for (const ans of answers) {
        let exist = false;

        for (const ansResult of answersResult) {
          if (
            ansResult.questionId &&
            ans.questionId &&
            ansResult.questionId === ans.questionId) {
            ansResult.answerId.push(ans.value);
            ansResult.answer.push(ans.value);
            exist = true;
          }
        }

        const question = await this.prisma.question.findFirst({
          where: {
            id: ans.questionId
          }
        });

        const option = await this.prisma.option.findFirst({
          where: {
            questionId: ans.questionId
          }
        });

        if (!exist) {
          answersResult.push({
            answer: [question && question.type !== "SIMPLE" && option ? option.value : ans.value],
            answerId: [ans.value],
            question: ans.question.title,
            questionId: ans.questionId
          });
        }
      }

      const sp = await this.prisma.serviceProvider.findFirst({
        where: {
          id: item.serviceProviderId
        },
        include: {
          user: true
        }
      });

      const clientRating = await this.helpers.getRating(item.job.client.userId);
      const spRating = await this.helpers.getRating(sp?.userId + "");

      const clientSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: sp?.userId + "",
          userId: item.job.client.userId,
        }
      });
      const serviceProviderSendReview = await this.prisma.reviewAndRating.count({
        where: {
          bookingId: item.id,
          reviewerId: item.job.client.userId,
          userId: sp?.userId + "",
        }
      });

      const hasStartedDispute = await this.prisma.fileDispute.count({
        where: {
          bookingId: item.id
        }
      }) > 0;

      const conversation = await this.prisma.conversation.findFirst({
        where: {
          bookingId: item.id
        }
      });

      const booking: ExtendedPrismaBooking = {
        hasStartedDispute,
        clientReview: 0,
        serviceProviderReview: 0,
        conversationId: `${conversation?.id}`,
        completedAt: item.completedAt,
        clientSendReview: clientSendReview > 0,
        serviceProviderSendReview: serviceProviderSendReview > 0,
        clientId: item.clientId,
        createdAt: item.createdAt,
        finalPrice: item.finalPrice,
        id: item.id,
        jobId: item.jobId,
        totalTryingToFinish: item.totalTryingToFinish,
        totalTryingToStart: item.totalTryingToStart,
        requestWorkState: item.requestWorkState,
        serviceProviderId: item.serviceProviderId,
        state: item.state,
        updatedAt: item.updatedAt,
        workDate: item.workDate,
        workState: item.workState,
        address: {
          id: item.job.address.id,
          latitude: item.job.address.latitude.toNumber(),
          line1: item.job.address.line1,
          line2: item.job.address.line2,
          longitude: item.job.address.longitude.toNumber(),
          name: item.job.address.name
        },
        category: category?.title + "",
        categoryId: category?.id + "",
        client: {
          id: item.job.client.id,
          name: item.job.client.firstName + " " + item.job.client.lastName,
          profileUrl: item.job.client.user.profileUrl,
          rating: clientRating
        },
        description: item.job.description,
        image1: item.job.image1,
        image2: item.job.image2 + "",
        image3: item.job.image3 + "",
        image4: item.job.image4 + "",
        image5: item.job.image5 + "",
        image6: item.job.image6 + "",
        service: item.job.service.title,
        serviceId: item.job.serviceId,
        serviceProvider: {
          id: sp?.id + "",
          name: sp?.firstName + " " + sp?.lastName,
          profileUrl: sp?.user.profileUrl + "",
          rating: spRating,
          isFavorite: await this.helpers.isFavorite({
            clientId: item.job.clientId,
            serviceProviderId: `${sp?.id}`
          })
        },
        subCategory: subCategory?.title + "",
        subCategoryId: subSubCategory?.subCategoryId + "",
        subSubCategory: subSubCategory?.title + "",
        subSubCategoryId: item.job.service.subSubCategoryId,
        title: item.job.title,
        answers: answersResult
      };

      result.push(booking);
    }

    return {
      data: result.map(PrismaBookingMapper.toDomain),
      meta: bookings.meta
    };
  }
  async increaseTotalTryingToFinish(params: { bookingId: string; total: number; }) {
    await this.prisma.booking.update({
      where: {
        id: params.bookingId
      },
      data: {
        totalTryingToFinish: params.total
      }
    });
  }
  async increaseTotalTryingToStart(params: { bookingId: string; total: number; }) {
    await this.prisma.booking.update({
      where: {
        id: params.bookingId
      },
      data: {
        totalTryingToStart: params.total
      }
    });
  }
  async updateRequestWorkState(bookingId: string, state: BookingRequestWorkState): Promise<void> {
    await this.prisma.booking.update({
      data: {
        requestWorkState: state
      },
      where: {
        id: bookingId
      }
    });
  }
  async findById(id: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findUnique(({
      where: {
        id
      },
      include: {
        conversation: true,
        job: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            service: true,
            address: true,
          }
        }
      }
    }));

    if (!booking) return null;

    const item = booking;

    const subSubCategory = await this.prisma.subSubCategory.findFirst({
      where: {
        id: item.job.service.subSubCategoryId
      }
    });
    const subCategory = await this.prisma.subCategory.findFirst({
      where: {
        id: subSubCategory?.subCategoryId
      }
    });
    const category = await this.prisma.category.findFirst({
      where: {
        id: subCategory?.categoryId
      }
    });
    const answers = await this.prisma.answerJob.findMany({
      where: {
        jobId: item.jobId
      },
      include: {
        question: true
      }
    });
    const answersResult: {
      question: string,
      answer: string[],
      answerId: string[]
      questionId: string
    }[] = [];

    for (const ans of answers) {
      let exist = false;

      for (const ansResult of answersResult) {
        if (
          ansResult.questionId &&
          ans.questionId &&
          ansResult.questionId === ans.questionId) {
          ansResult.answerId.push(ans.value);
          ansResult.answer.push(ans.value);
          exist = true;
        }
      }

      const question = await this.prisma.question.findFirst({
        where: {
          id: ans.questionId
        }
      });

      const option = await this.prisma.option.findFirst({
        where: {
          questionId: ans.questionId
        }
      });

      if (!exist) {
        answersResult.push({
          answer: [question && question.type !== "SIMPLE" && option ? option.value : ans.value],
          answerId: [ans.value],
          question: ans.question.title,
          questionId: ans.questionId
        });
      }
    }

    const sp = await this.prisma.serviceProvider.findFirst({
      where: {
        id: item.serviceProviderId
      },
      include: {
        user: true
      }
    });

    const clientRating = await this.helpers.getRating(item.job.client.userId);
    const spRating = await this.helpers.getRating(sp?.userId + "");

    const clientSendReview = await this.prisma.reviewAndRating.count({
      where: {
        bookingId: item.id,
        reviewerId: sp?.userId + "",
        userId: item.job.client.userId,
      }
    });
    const serviceProviderSendReview = await this.prisma.reviewAndRating.count({
      where: {
        bookingId: item.id,
        reviewerId: item.job.client.userId,
        userId: sp?.userId + "",
      }
    });

    const hasStartedDispute = await this.prisma.fileDispute.count({
      where: {
        bookingId: item.id
      }
    }) > 0;

    const bookingResult: ExtendedPrismaBooking = {
      hasStartedDispute,
      clientSendReview: clientSendReview > 0,
      serviceProviderSendReview: serviceProviderSendReview > 0,
      clientReview: 0,
      serviceProviderReview: 0,
      completedAt: item.completedAt,
      clientId: item.clientId,
      createdAt: item.createdAt,
      finalPrice: item.finalPrice,
      id: item.id,
      conversationId: item.conversation?.id + "",
      totalTryingToFinish: item.totalTryingToFinish,
      totalTryingToStart: item.totalTryingToStart,
      jobId: item.jobId,
      requestWorkState: item.requestWorkState,
      serviceProviderId: item.serviceProviderId,
      state: item.state,
      updatedAt: item.updatedAt,
      workDate: item.workDate,
      workState: item.workState,
      address: {
        id: item.job.address.id,
        latitude: item.job.address.latitude.toNumber(),
        line1: item.job.address.line1,
        line2: item.job.address.line2,
        longitude: item.job.address.longitude.toNumber(),
        name: item.job.address.name
      },
      category: category?.title + "",
      categoryId: category?.id + "",
      client: {
        id: item.job.client.id,
        name: item.job.client.firstName + " " + item.job.client.lastName,
        profileUrl: item.job.client.user.profileUrl,
        rating: clientRating
      },
      description: item.job.description,
      image1: item.job.image1,
      image2: item.job.image2 + "",
      image3: item.job.image3 + "",
      image4: item.job.image4 + "",
      image5: item.job.image5 + "",
      image6: item.job.image6 + "",
      service: item.job.service.title,
      serviceId: item.job.serviceId,
      serviceProvider: {
        id: sp?.id + "",
        name: sp?.firstName + " " + sp?.lastName,
        profileUrl: sp?.user.profileUrl + "",
        rating: spRating,
        isFavorite: await this.helpers.isFavorite({
          clientId: item.job.clientId,
          serviceProviderId: `${sp?.id}`
        })
      },
      subCategory: subCategory?.title + "",
      subCategoryId: subSubCategory?.subCategoryId + "",
      subSubCategory: subSubCategory?.title + "",
      subSubCategoryId: item.job.service.subSubCategoryId,
      title: item.job.title,
      answers: answersResult
    };

    return PrismaBookingMapper.toDomain(bookingResult);
  }
  async create(booking: Booking): Promise<string> {
    const data = PrismaBookingMapper.toPrisma(booking);

    const created = await this.prisma.booking.create({
      data: {
        state: data.state,
        workState: data.workState,
        jobId: data.jobId,
        serviceProviderId: data.serviceProviderId,
        clientId: data.clientId,
        finalPrice: data.finalPrice,
        requestWorkState: data.requestWorkState,
        workDate: data.workDate,
        totalTryingToFinish: data.totalTryingToFinish,
        totalTryingToStart: data.totalTryingToStart,
      }
    });

    return created.id;
  }
  async updateState(bookingId: string, state: BookingState): Promise<void> {
    await this.prisma.booking.update({
      data: {
        state
      },
      where: {
        id: bookingId
      }
    });
  }
  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.BookingWhereInput,
    orderBy?: Prisma.BookingOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include?: Prisma.BookingInclude
  }): Promise<PaginatorTypes.PaginatedResult<BookingProp>> {
    return paginate(
      this.prisma.booking,
      {
        where,
        orderBy,
        include
      },
      {
        page,
        perPage,
      },
    );
  }
}