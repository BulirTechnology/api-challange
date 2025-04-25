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
import { Role } from "@/infra/auth/enums/role.enum";
interface FetchClientTasksUseCaseRequest {
    language: LanguageSlug
    userId: string
    taskId: string
}

type FetchClientTasksUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        tasks: Task[]
        meta: MetaPagination
    }
>

@Injectable()
export class FetchSingleClientTask {
    constructor(
        private userRepository: UsersRepository,
        private clientRepository: ClientsRepository,
        private tasksRepository: TasksRepository
    ) { }

    async execute({
        userId,
        taskId
    }: FetchClientTasksUseCaseRequest): Promise<FetchClientTasksUseCaseResponse> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return left(new ResourceNotFoundError("Account not found"));
        }

        const client = await this.clientRepository.findByEmail(user.email);

        if (!client) {
            return left(new ResourceNotFoundError("Client not found"));
        }

        const tasks: any = await this.tasksRepository.findById(taskId);
        if (tasks.length < 1 || tasks.clientId.toString() != userId && user.accountType !=Role.SUPER_ADMIN) {
            return left(new ResourceNotFoundError("Task not found."));
        }
        return right({
            tasks: tasks.data,
            meta: tasks.meta
        });
    }
}
