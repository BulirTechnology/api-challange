import { PrismaService } from "../prisma.service";
import { Injectable } from "@nestjs/common";

import { AnswerJob } from "@/domain/work/enterprise/answer-job";
import { AnswersJobRepository } from "@/domain/work/application/repositories/answer-job-repository";
import { AnswerJobPaginationParams } from "@/domain/work/application/params/answer-job-params";

import { PrismaAnswerJobMapper } from "../mappers/prisma-answer-job-mapper";

@Injectable()
export class PrismaAnswersJobRepository implements AnswersJobRepository {
  constructor(private prisma: PrismaService) { }

  async findMany(params: AnswerJobPaginationParams): Promise<AnswerJob[]> {
    const page = params.page ?? 20;

    const answers = await this.prisma.answerJob.findMany({
      where: {
        jobId: params.jobId ? { equals: params.jobId } : {},
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: (page - 1) * 20,
    });

    return answers.map(PrismaAnswerJobMapper.toDomain);
  }

  async findById(id: string): Promise<AnswerJob | null> {
    const answer = await this.prisma.answerJob.findUnique({
      where: {
        id
      },
    });

    return answer ? PrismaAnswerJobMapper.toDomain(answer) : null;
  }

  async create(answer: AnswerJob): Promise<AnswerJob> {
    const data = PrismaAnswerJobMapper.toPrisma(answer);

    const dataCreated = await this.prisma.answerJob.create({ data });

    return PrismaAnswerJobMapper.toDomain(dataCreated);
  }

}