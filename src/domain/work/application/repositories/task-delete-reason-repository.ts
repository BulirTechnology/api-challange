import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { TaskDeleteReason } from "../../enterprise/task-delete-reason";

export abstract class TaskDeleteReasonRepository {
  abstract findByTitle(title: string): Promise<TaskDeleteReason | null>
  abstract findMany(params: PaginationParams): Promise<Pagination<TaskDeleteReason>>
  abstract findById(id: string): Promise<TaskDeleteReason | null>
  abstract create(answer: TaskDeleteReason): Promise<TaskDeleteReason>
}
 