import { Pagination } from "@/core/repositories/pagination-params";
import { JobCancelReason } from "../../enterprise/job-cancel-reason";
import { JobCancelReasonFindById, JobCancelReasonPaginationParams } from "../params/job-cancel-reason-params";

export abstract class JobCancelReasonRepository {
  abstract findByName(params: { language: "pt"|"en", name: string }): Promise<JobCancelReason | null>
  abstract findMany(params: JobCancelReasonPaginationParams): Promise<Pagination<JobCancelReason>>
  abstract findById(params: JobCancelReasonFindById): Promise<JobCancelReason | null>
  abstract create(answer: JobCancelReason): Promise<JobCancelReason>
}
