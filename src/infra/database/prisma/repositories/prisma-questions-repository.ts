import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginatorTypes, paginator } from "@nodeteam/nestjs-prisma-pagination";

import { QuestionsRepository } from "@/domain/work/application/repositories/question-repository";
import { Question, QuestionOptions, QuestionState } from "@/domain/work/enterprise/questions";

import { PrismaService } from "../prisma.service";
import {
  PrismaQuestionMapper,
  PrismaQuestionMapperType
} from "../mappers/prisma-question-mapper";

import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(private prisma: PrismaService) { }

  async findByTitle(title: string): Promise<Question | null> {
    const question = await this.prisma.question.findFirst({
      where: {
        title
      },
      include: { options: true }
    });

    return question ? PrismaQuestionMapper.toDomain(question) : null;
  }

  async findByTitleAndService(params: { title: string; serviceId: string; }): Promise<Question | null> {
    const question = await this.prisma.question.findFirst({
      where: {
        title: params.title,
        serviceId: params.serviceId
      },
      include: { options: true }
    });

    return question ? PrismaQuestionMapper.toDomain(question) : null;
  }

  async updateService(questionId: string, serviceId: string): Promise<void> {
    await this.prisma.question.update({
      where: { id: questionId },
      data: { serviceId }
    });
  }

  async addOption(data: { questionId: string; options: QuestionOptions[]; }): Promise<void> {
    for (const option of data.options) {
      await this.prisma.option.create({
        data: {
          value: option.value,
          questionId: data.questionId
        }
      });
    }
  }

  async updateState(questionId: string, state: QuestionState): Promise<void> {
    await this.prisma.question.update({
      where: { id: questionId },
      data: { state }
    });
  }

  async findMany(params: PaginationParams): Promise<Pagination<Question>> {
    const page = params.page;

    const questions = await this.paginate({
      orderBy: { createdAt: "desc", },
      include: { options: true },
      page,
      perPage: params.perPage
    });

    return {
      data: questions.data.map(PrismaQuestionMapper.toDomain),
      meta: questions.meta
    };
  }

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { options: true }
    });

    return question ? PrismaQuestionMapper.toDomain(question) : null;
  }

  async create(question: Question): Promise<Question> {
    const questionCreated = await this.prisma.question.create({
      data: {
        title: question.title,
        state: question.state,
        type: question.type,
        serviceId: question.serviceId.toString(),
      }
    });

    if (question.options && question.options.length > 0) {
      for (const option of question.options) {
        await this.prisma.option.create({
          data: {
            value: option.value,
            questionId: questionCreated.id
          }
        });
      }
    }

    return PrismaQuestionMapper.toDomain({
      createdAt: questionCreated.createdAt,
      id: questionCreated.id,
      options: [],
      serviceId: questionCreated.serviceId,
      state: questionCreated.state,
      title: questionCreated.title,
      type: questionCreated.type,
      updatedAt: questionCreated.updatedAt
    })
  }

  async paginate({ where, orderBy, page, perPage, include }: {
    where?: Prisma.QuestionWhereInput,
    orderBy?: Prisma.QuestionOrderByWithRelationInput
    include?: Prisma.QuestionInclude
    page?: number,
    perPage?: number,
  }): Promise<PaginatorTypes.PaginatedResult<PrismaQuestionMapperType>> {
    return paginate(
      this.prisma.question,
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