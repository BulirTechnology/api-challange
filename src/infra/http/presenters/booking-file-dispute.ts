import { FileDispute } from "@/domain/work/enterprise/file-dispute";


export class BookingFileDisputePresenter {
  static toHTTP(fileDispute: FileDispute) {
    return {
      id: fileDispute.id.toString(),
      booking_id: fileDispute.bookingId.toString(),
      description: fileDispute.description,
      dispute_reason: fileDispute.fileDisputeReason,
      file_dispute_reason_id: fileDispute.fileDisputeReasonId,
      resolution_comment: fileDispute.resolutionComment,
      resolution_date: fileDispute.resolutionDate,
      status: fileDispute.status,
      created_at: fileDispute.createdAt,
      updated_at: fileDispute.updatedAt
    };
  }
}