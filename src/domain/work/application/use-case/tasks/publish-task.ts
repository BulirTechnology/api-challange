import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  ResourceNotFoundError,
  InvalidAttachmentType
} from "@/core/errors";

import { Job } from "../../../enterprise";
import {
  UsersRepository,
  ClientsRepository,

} from "@/domain/users/application/repositories";
import { AnswerJob } from "@/domain/work/enterprise/answer-job";

import {
  TasksRepository,
  JobsRepository,
  PrivateTasksRepository,
  AnswersRepository,
  AnswersJobRepository,

} from "../../repositories";

interface PublishTaskUseCaseRequest {
  language: "en" | "pt"
  userId: string,
  taskId: string,
}

type PublishTaskUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class PublishTaskUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private jobsRepository: JobsRepository,
    private privateTasksRepository: PrivateTasksRepository,
    private answerRepository: AnswersRepository,
    private answerJobsRepository: AnswersJobRepository
  ) { }

  async execute({
    taskId,
    userId
  }: PublishTaskUseCaseRequest): Promise<PublishTaskUseCaseResponse> {
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

    if (task.viewState === "PRIVATE") {
      const list = await this.privateTasksRepository.findManyByTaskId({ taskId: task.id.toString() });

      if (list.length === 0) {
        return left(new ResourceNotFoundError("The task should select at least one service provider"));
      }
    }

    await this.tasksRepository.updateState(taskId, "PUBLISHED");

    const job = Job.create({
      addressId: new UniqueEntityID(task.addressId?.toString() + ""),
      clientId: task.clientId,
      description: task.description,
      image1: task.image1 + "",
      image2: task.image2,
      image3: task.image3,
      image4: task.image4,
      image5: task.image5,
      image6: task.image6,
      price: task.price,
      viewState: task.viewState,
      quotationState: "OPEN_TO_QUOTE",
      serviceId: new UniqueEntityID(task.serviceId?.toString() + ""),
      startDate: new Date(task.startDate?.toString() + ""),
      state: "OPEN",
      title: task.title,
    });

    const jobCreated = await this.jobsRepository.create(job);

    const answers = await this.answerRepository.findMany({
      taskId,
      page: 1,
    });

    for (const answer of answers) {
      const answerJob = AnswerJob.create({
        jobId: jobCreated.id,
        questionId: answer.questionId,
        value: answer.value,
        serviceQuestionId: answer.serviceQuestionId,
      });

      await this.answerJobsRepository.create(answerJob);
    }

    return right({
      message: "Task updated"
    });
  }
}
