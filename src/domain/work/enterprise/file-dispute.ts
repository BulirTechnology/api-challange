import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type FileDisputeStatus = "PENDING" | "COMPLETED"

export interface FileDisputeProps {
  userId: UniqueEntityID
  fileDisputeReasonId: UniqueEntityID
  description: string
  fileDisputeReason: string
  bookingId: UniqueEntityID
  status: FileDisputeStatus
  resolutionDate: Date | null
  resolutionComment: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class FileDispute extends Entity<FileDisputeProps> {
  get userId() {
    return this.props.userId;
  }
  get fileDisputeReasonId() {
    return this.props.fileDisputeReasonId;
  }
  get fileDisputeReason() {
    return this.props.fileDisputeReason;
  }
  get description() {
    return this.props.description;
  }
  get bookingId() {
    return this.props.bookingId;
  }
  get status() {
    return this.props.status;
  }
  get resolutionDate() {
    return this.props.resolutionDate;
  }
  get resolutionComment() {
    return this.props.resolutionComment;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: Optional<FileDisputeProps, "createdAt">, id?: UniqueEntityID) {
    const fileDispute = new FileDispute({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    }, id);

    return fileDispute;
  }
}
