import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { DraftStep, Task, TaskState } from "../../enterprise/task";

export abstract class TasksRepository {
  abstract findMany(params: PaginationParams & {
    title?: string,
    status?: "OPEN" | "CLOSED" | "BOOKED"
    viewState?: "PRIVATE" | "PUBLIC"
    categoryId?: string
    clientId: string
  }): Promise<Pagination<Task>>
  abstract findById(id: string): Promise<Task | null>
  abstract create(task: Task): Promise<Task>
  abstract updateImage(params: { taskId: string, url: string, field: string }): Promise<void>
  abstract updateService(taskId: string, serviceId: string): Promise<void>
  abstract updateCategoryId(taskId: string, categoryId: string): Promise<void>
  abstract updateSubCategoryId(taskId: string, subCategoryId: string): Promise<void>
  abstract updateSubSubCategoryId(taskId: string, subSubCategoryId: string): Promise<void>
  abstract updateAddress(taskId: string, addressId: string): Promise<void>
  abstract updateStartDate(taskId: string, startDate: Date): Promise<void>
  abstract updateState(taskId: string, state: TaskState): Promise<void>
  abstract updateDraftStep(taskId: string, step: DraftStep): Promise<void>
  abstract updateBaseInfo(task: Task): Promise<void>
  abstract deleteServiceProviders(taskId: string): Promise<void>
  abstract addServiceProviders(taskId: string, serviceProviders: string[]): Promise<void>
}
