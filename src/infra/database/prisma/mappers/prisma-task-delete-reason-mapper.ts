import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { TaskDeleteReason } from "@/domain/work/enterprise/task-delete-reason";
import { TaskDeleteReason as PrismaTaskDeleteReason } from "@prisma/client";

export class PrismaTaskDeleteReasonMapper {
  static toDomain(info: PrismaTaskDeleteReason): TaskDeleteReason {
    return TaskDeleteReason.create({
      value: info.value,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(task: TaskDeleteReason): PrismaTaskDeleteReason {
    return {
      id: task.id.toString(),
      value: task.value,
    };
  }
}