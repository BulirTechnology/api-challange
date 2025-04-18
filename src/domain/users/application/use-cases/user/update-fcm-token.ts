import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories/user-repository";
import { FcmTokenRepository } from "../../repositories/fcm-token-repository";
import { FcmToken } from "@/domain/users/enterprise/fcm-token";

interface UpdateFcmTokenUseCaseRequest {
  userId: string;
  token: string;
  deviceType: "android" | "ios" | "web";
}

type UpdateFcmTokenUseCaseResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class UpdatePushNotificationTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private fcmTokenRepository: FcmTokenRepository
  ) {}

  async execute({
    userId,
    token,
    deviceType,
  }: UpdateFcmTokenUseCaseRequest): Promise<UpdateFcmTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const fcmToken = FcmToken.create({
      deviceType,
      notificationToken: token,
      status: "ACTIVE",
      userId: userId,
    });

    this.fcmTokenRepository.createOrUpdate(fcmToken);

    return right(null);
  }
}
