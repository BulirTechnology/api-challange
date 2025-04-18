import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaAnswerMapper } from "../mappers/prisma-answer-mapper";

import { AnswersRepository } from "@/domain/work/application/repositories/answer-repository";
import { Answer } from "@/domain/work/enterprise/answer";
import { AnswerPaginationParams } from "@/domain/work/application/params/answer-params";

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(private prisma: PrismaService) { }

  async delete(taskId: string, questionId: string): Promise<void> {
    await this.prisma.answer.deleteMany({
      where: {
        taskId,
        questionId
      }
    });
  }

  async findMany(params: AnswerPaginationParams): Promise<Answer[]> {
    const { page, taskId } = params;

    const answers = await this.prisma.answer.findMany({
      where: { taskId: taskId ? { equals: taskId } : {}, },
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: (page - 1) * 20,
    });

    return answers.map(PrismaAnswerMapper.toDomain);
  }

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id
      },
    });

    return answer ? PrismaAnswerMapper.toDomain(answer) : null;
  }

  async create(answer: Answer): Promise<void> {
    const data = PrismaAnswerMapper.toPrisma(answer);

    await this.prisma.answer.create({ data });
  }
}