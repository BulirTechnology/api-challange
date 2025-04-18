import { FcmToken } from "../../enterprise/fcm-token";

export abstract class FcmTokenRepository {
  abstract createOrUpdate(fcmToken: FcmToken): Promise<void>
  abstract deleteOfUser(userId: string): Promise<void>
  abstract findToken(userId: string): Promise<FcmToken | null>
}
