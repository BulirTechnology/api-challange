import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { Activity } from "../../enterprise/activity";

export abstract class ActivityRepository {
  abstract findMany(params: PaginationParams & { userId?: string }): Promise<Pagination<Activity>>
  abstract create(activity: Activity): Promise<void>
}
