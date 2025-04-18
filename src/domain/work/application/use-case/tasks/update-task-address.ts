import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";

import {
  UsersRepository,
  ClientsRepository,
  AddressesRepository
} from "@/domain/users/application/repositories";

import { TasksRepository } from "../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface UpdateTaskAddressUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  addressId: string
}

type UpdateTaskAddressUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskAddressUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private addressesRepository: AddressesRepository
  ) { }

  async execute({
    addressId,
    taskId,
    userId
  }: UpdateTaskAddressUseCaseRequest): Promise<UpdateTaskAddressUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError("Client not found"));
    }

    const task = await this.tasksRepository.findById(taskId);

    if (!task) {
      return left(new ResourceNotFoundError("Task not found"));
    }

    if (task.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError("Task not found."));
    }

    const address = await this.addressesRepository.findById(addressId);

    if (!address) {
      return left(new ResourceNotFoundError("Address not found"));
    }

    if (address.userId.toString() !== user.id.toString()) {
      return left(new ResourceNotFoundError("Address not found"));
    }

    await this.tasksRepository.updateAddress(taskId, addressId);

    if (task.state === "DRAFT" && task.draftStep === "SelectAddress")
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectCategory");

    return right({
      message: "Task updated"
    });
  }
}
