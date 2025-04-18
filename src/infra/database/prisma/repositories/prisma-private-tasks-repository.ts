import { Injectable } from "@nestjs/common";

import { PrivateTasksRepository } from "@/domain/work/application/repositories/private-task-repository";
import { PrivateTask } from "@/domain/work/enterprise/private-task";

import { PrismaService } from "../prisma.service";
import { PrismaPrivateTaskMapper } from "../mappers/prisma-private-task-mapper";

@Injectable()
export class PrismaPrivateTasksRepository implements PrivateTasksRepository {
  constructor(private prisma: PrismaService) { }

  async findManyByTaskId(params: { taskId: string; }): Promise<PrivateTask[]> {
    const promotions = await this.prisma.privateTask.findMany({
      where: { taskId: params.taskId }
    });

    return promotions.map(PrismaPrivateTaskMapper.toDomain);
  }

  async findById(id: string): Promise<PrivateTask | null> {
    const privateTask = await this.prisma.privateTask.findUnique({
      where: { id }
    });

    return privateTask ? PrismaPrivateTaskMapper.toDomain(privateTask) : null;
  }

  async create(privateTask: PrivateTask): Promise<void> {
    const data = PrismaPrivateTaskMapper.toPrisma(privateTask);

    await this.prisma.privateTask.create({ data });
  }
}