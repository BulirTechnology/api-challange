import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { User } from "@/domain/users/enterprise";
import { UsersRepository } from "../../../repositories";
import { ResourceNotFoundError } from "@/core/errors";
import { BookingsRepository } from "@/domain/work/application/repositories";
import { PrismaHelpersRatingAndFavoriteRepository } from "@/infra/database/prisma/prisma-common-helpers.service";

interface GetUserByIdUseCaseRequest {
  id: string;
}

type GetUserByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    user: User;
    rating: number;
  }
>;

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    private userRepository: UsersRepository,
    private helpers: PrismaHelpersRatingAndFavoriteRepository
  ) {}

  async execute({
    id,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.userRepository.findDetailsByUserId(id);

    if (!user) {
      return left(new ResourceNotFoundError("User not found"));
    }

    const rating = await this.helpers.getUserRating(id);

    const sanitizedUser = Object.fromEntries(
      Object.entries(user).filter(([key, value]) => key !== "password")
    ) as unknown as User;

    return right({
      user: sanitizedUser,
      rating,
    });
  }
}
