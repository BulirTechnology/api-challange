import { FileDisputeReason } from "@/domain/work/enterprise/file-dispute-reason";

export class FileDisputeReasonPresenter {
  static toHTTP(fileDisputeReason: FileDisputeReason) {
    return {
      id: fileDisputeReason.id.toString(),
      name: fileDisputeReason.value,
      created_at: fileDisputeReason.createdAt,
      updated_at: fileDisputeReason.updatedAt
    };
  }
}