import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Task } from "../../../enterprise";
import { TasksRepository } from "../../repositories";
import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface FetchClientTasksUseCaseRequest {
  language: LanguageSlug
  userId: string
  page: number
  perPage?: number
  status: "OPEN" | "CLOSED" | "BOOKED" | "ALL"
  categoryId?: string
  viewState: "PRIVATE" | "PUBLIC" | "ALL"
  title?: string
}

type FetchClientTasksUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    tasks: Task[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchClientTasksUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository
  ) { }

  async execute({
    page,
    userId,
    status,
    viewState,
    categoryId,
    title,
    perPage
  }: FetchClientTasksUseCaseRequest): Promise<FetchClientTasksUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError("Client not found"));
    }

    const tasks = await this.tasksRepository.findMany({
      page,
      clientId: client.id.toString(),
      title,
      status: status === "ALL" ? undefined : status,
      viewState: viewState === "ALL" ? undefined : viewState,
      categoryId,
      perPage
    });

    return right({
      tasks: tasks.data,
      meta: tasks.meta
    });
  }
}
