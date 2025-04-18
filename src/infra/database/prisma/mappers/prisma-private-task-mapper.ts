import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { PrivateTask } from "@/domain/work/enterprise/private-task";
import { PrivateTask as PrismaPrivateTask } from "@prisma/client";

export class PrismaPrivateTaskMapper {
  static toDomain(info: PrismaPrivateTask): PrivateTask {
    return PrivateTask.create({
      serviceProviderId: info.serviceProviderId,
      taskId: info.taskId,
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(privateTask: PrivateTask): PrismaPrivateTask {
    return {
      id: privateTask.id.toString(),
      serviceProviderId: privateTask.serviceProviderId,
      taskId: privateTask.taskId,
    };
  }
}