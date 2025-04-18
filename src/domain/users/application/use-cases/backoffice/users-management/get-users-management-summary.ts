import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../../repositories";

interface UsersManagementGetSummaryUseCaseResponse {
  currentWeek: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalClients: number;
    totalServiceProviders: number;
    from: string;
    to: string;
  };
  previousWeek: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalClients: number;
    totalServiceProviders: number;
    from: string;
    to: string;
  };
}

interface UsersManagementGetSummaryRequest {
  startOfCurrentWeek: Date;
  endOfCurrentWeek: Date;
}

@Injectable()
export class UsersManagementGetSummaryUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    request: UsersManagementGetSummaryRequest
  ): Promise<UsersManagementGetSummaryUseCaseResponse> {
    const { startOfCurrentWeek, endOfCurrentWeek } = request;

    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

    const currentWeekSummary =
      await this.usersRepository.usersManagementGetSummaryByDateRange(
        startOfCurrentWeek,
        endOfCurrentWeek
      );

    const previousWeekSummary =
      await this.usersRepository.usersManagementGetSummaryByDateRange(
        startOfPreviousWeek,
        startOfCurrentWeek
      );

    return {
      currentWeek: {
        ...currentWeekSummary,
        from: startOfCurrentWeek.toISOString().split("T")[0],
        to: endOfCurrentWeek.toISOString().split("T")[0],
      },
      previousWeek: {
        ...previousWeekSummary,
        from: startOfPreviousWeek.toISOString().split("T")[0],
        to: startOfCurrentWeek.toISOString().split("T")[0],
      },
    };
  }
}
