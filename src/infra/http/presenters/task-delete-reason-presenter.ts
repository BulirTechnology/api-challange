import { TaskDeleteReason } from "@/domain/work/enterprise/task-delete-reason";

export class TaskDeleteReasonPresenter {
  static toHTTP(taskDeleteReason: TaskDeleteReason) {
    return {
      id: taskDeleteReason.id.toString(),
      name: taskDeleteReason.value,
      created_at: taskDeleteReason.createdAt,
      updated_at: taskDeleteReason.updatedAt
    };
  }
}