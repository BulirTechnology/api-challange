import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export type NotificationType =
  "RegisterSuccess" |
  "NewOfferReceivedQuotation" |
  "RequestToCompleteJob" |
  "RequestToStartJob" |
  "JobExpired" |
  "MoneyAddedToWallet" |
  "MoneyWithdraw" |
  "Promotions" |
  "JobDisputeRaised" |
  "JobDisputeClosed" |
  "JobCompleteAutoApproval" |
  "PurchaseCredit" |
  "JobQuoted" |
  "JobAccepted" |
  "JobQuotedRejected" |
  "RequestToStartJobDenied" |
  "RequestToStartJobAccepted" |
  "RequestToCompleteJobDenied" |
  "RequestToCompleteJobAccepted" |
  "BookingStartIn1Hour" |
  "BookingStartIn15Minutes" |
  "SubscriptionAboutExpire"

export interface NotificationProps {
  userId: UniqueEntityID
  title: string
  titleEn: string
  readed: boolean
  type: NotificationType
  description: string
  descriptionEn: string
  parentId: string | null
  createdAt?: Date | null
  updatedAt?: Date | null
}

export class Notification extends Entity<NotificationProps> {
  get userId() {
    return this.props.userId;
  }
  get title() {
    return this.props.title;
  }
  get titleEn() {
    return this.props.titleEn;
  }
  get readed() {
    return this.props.readed;
  }
  get description() {
    return this.props.description;
  }
  get descriptionEn() {
    return this.props.descriptionEn;
  }
  get type() {
    return this.props.type;
  }
  get parentId() {
    return this.props.parentId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: NotificationProps, id?: UniqueEntityID) {
    const notification = new Notification(props, id);

    return notification;
  }
}
