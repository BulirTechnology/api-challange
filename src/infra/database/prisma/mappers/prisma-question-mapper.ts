import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "@/domain/work/enterprise/questions";
import {
  Question as PrismaQuestion,
  Option as PrismaQuestionOptions
} from "@prisma/client";

export type PrismaQuestionMapperType = PrismaQuestion & {
  options: PrismaQuestionOptions[]
}

export class PrismaQuestionMapper {
  static toDomain(info: PrismaQuestionMapperType): Question {
    return Question.create({
      title: info.title,
      state: info.state,
      type: info.type,
      serviceId: new UniqueEntityID(info.serviceId?.toString()),
      options: info.options.map(option => ({
        id: new UniqueEntityID(option.id),
        value: option.value
      })),
      createdAt: info.createdAt,
      updatedAt: info.updatedAt
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(question: Question): PrismaQuestion {
    return {
      id: question.id.toString(),
      title: question.title,
      serviceId: question.serviceId.toString(),
      state: question.state,
      type: question.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}