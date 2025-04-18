import { Pagination } from "@/core/repositories/pagination-params";
import { PushNotification } from "../../enterprise/push-notification";

export abstract class PushNotificationRepository {
  abstract fetchPending(): Promise<Pagination<PushNotification>>
  abstract create(pushNotification: PushNotification): Promise<void>
  abstract delete(id: string): Promise<void>
}
