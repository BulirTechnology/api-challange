import { PaginationParams } from "@/core/repositories/pagination-params";
import { FileDispute } from "../../enterprise/file-dispute";

export abstract class FileDisputeRepository {
  abstract findMany(params: PaginationParams): Promise<FileDispute[]>
  abstract findById(id: string): Promise<FileDispute | null>
  abstract findByBookingId(bookingId: string): Promise<FileDispute | null>
  abstract create(answer: FileDispute): Promise<void>
}
