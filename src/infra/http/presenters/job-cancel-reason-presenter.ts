import { JobCancelReason } from "@/domain/work/enterprise/job-cancel-reason";

export class JobCancelReasonPresenter {
  static toHTTP(jobCancelReason: JobCancelReason) {
    return {
      id: jobCancelReason.id.toString(),
      name: jobCancelReason.value,
      created_at: jobCancelReason.createdAt,
      updated_at: jobCancelReason.updatedAt
    };
  }
}