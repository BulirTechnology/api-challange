import { Pagination } from "@/core/repositories/pagination-params";
import { Job, JobState, QuotationState } from "../../enterprise/job";
import { JobPaginationParams } from "../params/job-params";
import { AccountType } from "@/domain/users/enterprise/user";

export abstract class JobsRepository {
  abstract findMany(params: JobPaginationParams): Promise<Pagination<Job>>
  abstract findNearJobsProvider(params: JobPaginationParams): Promise<any>
  abstract findById(params: {
    id: string
    accountType: AccountType | "Any",
    userId: string
  }): Promise<Job | null>
  abstract create(job: Job): Promise<Job>
  abstract countUnreadedQuotations(params: { clientId: string }): Promise<number>
  abstract updateImage(params: { jobId: string, url: string, field: string }): Promise<void>
  abstract updateService(jobId: string, serviceId: string): Promise<void>
  abstract updateAddress(jobId: string, addressId: string): Promise<void>
  abstract updateStartDate(jobId: string, startDate: Date): Promise<void>
  abstract updateState(jobId: string, state: JobState): Promise<void>
  abstract updateQuotationState(jobId: string, state: QuotationState): Promise<void>
  abstract cancelJob(data: {
    id: string
    state: JobState
    description: string
    reasonId: string
  }): Promise<void>
}
