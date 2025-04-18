import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";
import { TasksRepository } from "@/domain/work/application/repositories/task-repository";
import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { DraftStep, Task, TaskState } from "@/domain/work/enterprise/task";
import { PrismaTaskMapper } from "../mappers/prisma-task-mapper";
import {
  Prisma,
  Task as PrismaTask,
  Address,
  PrivateTask,
  ServiceProvider as PrismaServiceProvider,
  User as PrismaUser
} from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

export type TaskProps = PrismaTask & {
  address: Address,
  privateTask: PrivateTask[]
}

type SPFilter = {
  id: string;
  taskId: string;
  serviceProviderId: string;
  serviceProvider: PrismaServiceProvider & {
    user: PrismaUser
  }
}[]

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private prisma: PrismaService) { }

  async isFavorite(params: { clientId: string; serviceProviderId: string; }): Promise<boolean> {
    const total = await this.prisma.clientServiceProviderFavorite.count({
      where: {
        clientId: params.clientId,
        serviceProviderId: params.serviceProviderId
      }
    });

    return total > 0;
  }
  async getRating(userId: string) {
    const reviewsAndRating = await this.prisma.reviewAndRating.aggregate({
      _count: {
        stars: true,
        reviewerId: true
      },
      where: {
        reviewerId: userId
      }
    });

    const stars = reviewsAndRating._count.stars;

    if (stars <= 0) return 0;

    return stars / reviewsAndRating._count.reviewerId;
  }
  async updateSubCategoryId(taskId: string, subCategoryId: string): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        subCategoryId
      }
    });
  }
  async updateSubSubCategoryId(taskId: string, subSubCategoryId: string): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        subSubCategoryId
      }
    });
  }
  async updateCategoryId(taskId: string, categoryId: string): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        categoryId
      }
    });
  }
  async updateDraftStep(taskId: string, step: DraftStep): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        draftStep: step
      }
    });
  }
  async deleteServiceProviders(taskId: string): Promise<void> {
    await this.prisma.privateTask.deleteMany({
      where: {
        taskId
      }
    });
  }
  async addServiceProviders(taskId: string, serviceProviderIds: string[]): Promise<void> {
    for (const serviceProviderId of serviceProviderIds) {
      await this.prisma.privateTask.create({
        data: {
          serviceProviderId: serviceProviderId,
          taskId
        }
      });
    }
  }
  async updateBaseInfo(task: Task): Promise<void> {
    const data = PrismaTaskMapper.toPrisma(task);

    await this.prisma.task.update({
      data: {
        description: data.description,
        price: data.price,
        title: data.title,
        viewState: data.viewState,
      },
      where: {
        id: data.id.toString()
      }
    });
  }
  async updateState(taskId: string, state: TaskState): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        state
      }
    });
  }
  async updateStartDate(taskId: string, startDate: Date): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        startDate
      }
    });
  }
  async updateAddress(taskId: string, addressId: string) {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        addressId
      }
    });
  }
  async updateService(taskId: string, serviceId: string): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        serviceId
      }
    });
  }
  async findMany(params: PaginationParams & {
    title?: string,
    status?: "OPEN" | "CLOSED" | "BOOKED"
    viewState?: "PRIVATE" | "PUBLIC"
    categoryId?: string
    clientId: string
  }): Promise<Pagination<Task>> {
    const page = params.page;

    const list = await this.paginate({
      where: {
        clientId: params.clientId,
        viewState: params.viewState ? params.viewState : {},
        title: params.title ? {
          contains: params.title,
          mode: 'insensitive'
        } : {},
        state: {
          not: "INACTIVE"
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      page,
      perPage: params.perPage,
      include: {
        address: true,
        privateTask: {
          include: {
            serviceProvider: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    const result: Task[] = [];
    for (const task of list.data) {
      const answers = await this.prisma.answer.findMany({
        where: {
          taskId: task.id
        },
        include: {
          question: true
        }
      });

      const service = await this.prisma.services.findFirst({
        where: {
          id: task?.serviceId?.toString()
        }
      });
      const subSubCategory = await this.prisma.subSubCategory.findFirst({
        where: {
          id: service?.subSubCategoryId
        }
      });
      const subCategory = await this.prisma.subCategory.findFirst({
        where: {
          id: task?.subCategoryId + ""
        }
      });
      const category = await this.prisma.category.findFirst({
        where: {
          id: task?.categoryId + ""
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

      const data = PrismaTaskMapper.toDomain({
        addressId: task.addressId,
        clientId: task.clientId,
        createdAt: task.createdAt,
        description: task.description,
        id: task.id,
        image1: task.image1,
        image2: task.image2,
        image3: task.image3,
        image4: task.image4,
        image5: task.image5,
        image6: task.image6,
        price: task.price,
        serviceId: service ? service.id : task.serviceId,
        startDate: task.startDate,
        state: task.state,
        title: task.title,
        categoryId: task.categoryId,
        subCategoryId: task.subCategoryId,
        subSubCategoryId: task.subSubCategoryId,
        viewState: task.viewState,
        updatedAt: task.updatedAt,
        address: task.address ? {
          id: task.address.id,
          isPrimary: task.address.isPrimary,
          name: task.address.name,
          latitude: task.address?.latitude.toNumber(),
          line1: task.address?.line1,
          line2: task.address?.line2,
          longitude: task.address?.longitude.toNumber(),
        } : undefined,
        answers: answersResult,
        draftStep: task.draftStep,
        service: service ? { id: service.id, title: service.title } : undefined,
        category: category ? { id: category.id, title: category.title } : undefined,
        subCategory: subCategory ? { id: subCategory.id, title: subCategory.title } : undefined,
        subSubCategory: subSubCategory ? { id: subSubCategory.id, title: subSubCategory.title } : undefined,
        serviceProviderIds: task.privateTask ? task.privateTask.map(item => item.serviceProviderId) : [],
        serviceProviders: task.privateTask ? await this.getServiceProviderData(task.privateTask as SPFilter, task.clientId) : []
      });

      result.push(data);
    }

    return {
      data: result,
      meta: list.meta
    };
  }
  async getServiceProviderData(privateTask: SPFilter = [], clientId: string) {
    const result: {
      id: string;
      firstName: string;
      lastName: string;
      rating: number;
      userId: string;
      isFavorite: boolean;
      profileImage: string;
    }[] = [];

    for (let i = 0; i < privateTask.length; i++) {
      result.push({
        id: privateTask[i].serviceProvider.id,
        firstName: privateTask[i].serviceProvider.firstName,
        lastName: privateTask[i].serviceProvider.lastName,
        rating: await this.getRating(privateTask[i].serviceProvider.userId),
        userId: privateTask[i].serviceProvider.userId,
        isFavorite: await this.isFavorite({
          clientId: clientId,
          serviceProviderId: privateTask[i].serviceProviderId
        }),
        profileImage: privateTask[i].serviceProvider.user.profileUrl
      });
    }

    return result;
  }
  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: {
        id
      },
      include: {
        address: true,
        privateTask: {
          include: {
            serviceProvider: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!task) return null;

    const answers = await this.prisma.answer.findMany({
      where: {
        taskId: task.id
      },
      include: {
        question: true
      }
    });

    const service = await this.prisma.services.findFirst({
      where: {
        id: task.serviceId?.toString()
      }
    });
    const subSubCategory = await this.prisma.subSubCategory.findFirst({
      where: {
        id: service?.subSubCategoryId
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

    return PrismaTaskMapper.toDomain({
      addressId: task.addressId,
      clientId: task.clientId,
      createdAt: task.createdAt,
      description: task.description,
      id: task.id,
      image1: task.image1,
      image2: task.image2,
      image3: task.image3,
      image4: task.image4,
      image5: task.image5,
      image6: task.image6,
      price: task.price,
      startDate: task.startDate,
      state: task.state,
      title: task.title,
      categoryId: task.categoryId,
      subCategoryId: task.subCategoryId,
      subSubCategoryId: task.subSubCategoryId,
      serviceId: task.serviceId,
      viewState: task.viewState,
      updatedAt: task.updatedAt,
      address: task.address ? {
        id: task.address.id,
        isPrimary: task.address.isPrimary,
        name: task.address.name,
        latitude: task.address?.latitude.toNumber(),
        line1: task.address?.line1,
        line2: task.address?.line2,
        longitude: task.address?.longitude.toNumber(),
      } : undefined,
      answers: answersResult,
      draftStep: task.draftStep,
      service: service ? { id: service.id, title: service.title } : undefined,
      category: category ? { id: category.id, title: category.title } : undefined,
      subCategory: subCategory ? { id: subCategory.id, title: subCategory.title } : undefined,
      subSubCategory: subSubCategory ? { id: subSubCategory.id, title: subSubCategory.title } : undefined,
      serviceProviderIds: task.privateTask.map(item => item.serviceProviderId),
      serviceProviders: task.privateTask ? await this.getServiceProviderData(task.privateTask, task.clientId) : []
    });
  }
  async create(task: Task): Promise<Task> {
    const data = PrismaTaskMapper.toPrisma(task);

    const taskCreated = await this.prisma.task.create({
      data: {
        description: data.description,
        price: data.price,
        serviceId: data.serviceId,
        startDate: data.startDate,
        title: data.title,
        clientId: data.clientId,
        viewState: data.viewState,
        state: "DRAFT"
      }
    });

    return PrismaTaskMapper.toDomain({
      ...taskCreated,
      serviceProviderIds: [],
      serviceProviders: []
    });
  }
  async updateImage(params: { taskId: string, url: string, field: string }): Promise<void> {
    await this.prisma.task.update({
      where: {
        id: params.taskId
      },
      data: {
        [params.field]: params.url,
      }
    });
  }
  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.TaskWhereInput,
    orderBy?: Prisma.TaskOrderByWithRelationInput
    page?: number,
    perPage?: number,
    include: Prisma.TaskInclude
  }): Promise<PaginatorTypes.PaginatedResult<TaskProps>> {
    return paginate(
      this.prisma.task,
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