import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Answer } from "@/domain/work/enterprise/answer";
import {
  Answer as PrismaAnswer,
} from "@prisma/client";

export class PrismaAnswerMapper {
  static toDomain(info: PrismaAnswer & {
    questionId: string
  },): Answer {
    return Answer.create({
      questionId: new UniqueEntityID(info.questionId),
      taskId: new UniqueEntityID(info.taskId),
      value: info.value,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(answer: Answer): PrismaAnswer {
    return {
      id: answer.id.toString(),
      taskId: answer.taskId.toString(),
      value: answer.value,
      createdAt: new Date(),
      updatedAt: new Date(),
      questionId: answer.questionId.toString()
    };
  }
}