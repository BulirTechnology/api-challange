import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { AnswerJob } from "@/domain/work/enterprise/answer-job";
import {
  AnswerJob as PrismaAnswer,
} from "@prisma/client";

export class PrismaAnswerJobMapper {
  static toDomain(info: PrismaAnswer & {
    questionId: string
  },): AnswerJob {
    return AnswerJob.create({
      questionId: new UniqueEntityID(info.questionId),
      jobId: new UniqueEntityID(info.jobId),
      value: info.value
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(answer: AnswerJob): PrismaAnswer {
    return {
      id: answer.id.toString(),
      jobId: answer.jobId.toString(),
      value: answer.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      questionId: answer.questionId.toString()
    };
  }
}