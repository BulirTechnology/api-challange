import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { ResourceNotFoundError } from "@/core/errors";
import { UsersRepository } from "../../repositories/user-repository";
import { HashGenerator } from "../../cryptography/hash-generator";
import { HashComparator } from "../../cryptography/hash-comparator";
import { WrongCredentialsError } from "../errors/wrong-credentials-error";

interface UpdateUserPasswordUseCaseRequest {
  language: "en" | "pt"
  userId: string
  currentPassword: string
  newPassword: string
}

type UpdateUserPasswordUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
    private hashComparator: HashComparator,
  ) { }

  async execute({
    newPassword,
    currentPassword,
    userId
  }: UpdateUserPasswordUseCaseRequest): Promise<UpdateUserPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const isPasswordValid = await this.hashComparator.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const hashedPassword = await this.hashGenerator.hash(newPassword);

    this.usersRepository.updatePassword(userId, hashedPassword);

    return right(null);
  }
}
