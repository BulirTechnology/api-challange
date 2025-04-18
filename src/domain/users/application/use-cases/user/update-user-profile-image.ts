import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { AccountAlreadyExistsError } from "../errors/account-already-exists-error";
import { UsersRepository } from "../../repositories/user-repository";
import { ResourceNotFoundError } from "@/core/errors";

interface UpdateUserProfileImageCaseRequest {
  language: "en" | "pt"
  userId: string
  profileUrl: string | null
}

type UpdateUserProfileImageCaseResponse = Either<
  AccountAlreadyExistsError,
  {
    message: string
  }
>

@Injectable()
export class UpdateUserProfileImageCase {
  constructor(
    private usersRepository: UsersRepository,
  ) { }

  async execute({
    userId,
    profileUrl
  }: UpdateUserProfileImageCaseRequest): Promise<UpdateUserProfileImageCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    if (!profileUrl) return left(new ResourceNotFoundError("Image not found"));


    await this.usersRepository.updateProfileImage({
      userId: user.id.toString(),
      profileUrl
    });


    return right({
      message: "Profile updated",
    });
  }
}
