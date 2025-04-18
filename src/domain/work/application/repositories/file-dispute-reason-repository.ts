import { Pagination } from "@/core/repositories/pagination-params";
import { FileDisputeReason } from "../../enterprise/file-dispute-reason";
import { FileDisputeFindById, FileDisputePaginationParams } from "../params/file-dispute-reason-params";

export abstract class FileDisputeReasonRepository {
  abstract findByName(name: string): Promise<FileDisputeReason | null>
  abstract findMany(params: FileDisputePaginationParams): Promise<Pagination<FileDisputeReason>>
  abstract findById(params: FileDisputeFindById): Promise<FileDisputeReason | null>
  abstract create(answer: FileDisputeReason): Promise<FileDisputeReason>
}
