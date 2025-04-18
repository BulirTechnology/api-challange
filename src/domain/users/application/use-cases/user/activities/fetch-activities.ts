import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { Pagination } from "@/core/repositories/pagination-params";

import { ActivityRepository } from "../../../repositories";

import { Activity } from "@/domain/users/enterprise";

interface FetchActivitiesUseCaseRequest {
  page: number
  perPage?: number
  userId?: string
}

type FetchActivitiesUseCaseResponse = Either<
  null,
  {
    result: Pagination<Activity>
  }
>

@Injectable()
export class FetchActivitiesUseCase {
  constructor(private activityRepository: ActivityRepository) { }

  async execute({
    userId,
    page,
    perPage
  }: FetchActivitiesUseCaseRequest): Promise<FetchActivitiesUseCaseResponse> {
    const result = await this.activityRepository.findMany({
      page,
      userId,
      perPage
    });

    return right({
      result
    });
  }
}
