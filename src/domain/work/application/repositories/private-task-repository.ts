import { PrivateTask } from "../../enterprise/private-task";

export abstract class PrivateTasksRepository {
  abstract findManyByTaskId(params: { taskId: string }): Promise<PrivateTask[]>
  abstract findById(id: string): Promise<PrivateTask | null>
  abstract create(privateTask: PrivateTask): Promise<void>
}
