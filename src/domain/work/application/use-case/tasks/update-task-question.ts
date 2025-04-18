import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import {
  InvalidAttachmentType,
  ResourceNotFoundError
} from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ClientsRepository
} from "@/domain/users/application/repositories";

import {
  TasksRepository,
  QuestionsRepository,
  AnswersRepository
} from "../../repositories";

import { Answer, Task } from "../../../enterprise";
import { LanguageSlug } from "@/domain/users/enterprise";

interface UpdateTaskQuestionUseCaseRequest {
  language: LanguageSlug
  userId: string,
  taskId: string,
  answerData: {
    questionId: string
    answers: string[]
  }[]
}

type UpdateTaskQuestionUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    message: string
  }
>

@Injectable()
export class UpdateTaskQuestionUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private tasksRepository: TasksRepository,
    private questionsRepository: QuestionsRepository,
    private answersRepository: AnswersRepository
  ) { }

  async execute({
    taskId,
    userId,
    answerData
  }: UpdateTaskQuestionUseCaseRequest): Promise<UpdateTaskQuestionUseCaseResponse> {
    const validationError = await this.validateEntities(userId, taskId, answerData);
    if (validationError) return left(validationError);

    await this.deleteExistingAnswers(taskId, answerData);
    await this.saveNewAnswers(taskId, answerData);

    const task = await this.tasksRepository.findById(taskId);
    await this.updateTaskState(task!);

    return right({ message: "Task updated" });
  }


  private async validateEntities(userId: string, taskId: string, answerData: { questionId: string; answers: string[] }[]) {
    const user = await this.userRepository.findById(userId);
    if (!user) return new ResourceNotFoundError("Account not found");

    const client = await this.clientRepository.findByEmail(user.email);
    if (!client) return new ResourceNotFoundError("Client not found");

    const task = await this.tasksRepository.findById(taskId);
    if (!task) return new ResourceNotFoundError("Task not found");

    if (task.clientId.toString() !== client.id.toString()) return new ResourceNotFoundError("Task not found");

    if (answerData.length === 0) return new ResourceNotFoundError("No answer provided");

    for (const answer of answerData) {
      const question = await this.questionsRepository.findById(answer.questionId);
      if (!question) return new ResourceNotFoundError(`Question id: ${answer.questionId} not found`);
    }

    return null;
  }

  private async deleteExistingAnswers(taskId: string, answerData: { questionId: string; answers: string[] }[]) {
    for (const info of answerData) {
      await this.answersRepository.delete(taskId, info.questionId);
    }
  }

  private async saveNewAnswers(taskId: string, answerData: { questionId: string; answers: string[] }[]) {
    for (const info of answerData) {
      const question = await this.questionsRepository.findById(info.questionId);

      if (question?.type === "MULTIPLE_SELECT") {
        for (const itemAnswer of info.answers) {
          const answerInfo = Answer.create({
            questionId: new UniqueEntityID(info.questionId),
            taskId: new UniqueEntityID(taskId),
            value: itemAnswer
          });

          await this.answersRepository.create(answerInfo);
        }
      } else {
        const answerInfo = Answer.create({
          questionId: new UniqueEntityID(info.questionId),
          taskId: new UniqueEntityID(taskId),
          value: info.answers[0]
        });

        await this.answersRepository.create(answerInfo);
      }
    }
  }

  private async updateTaskState(task: Task) {
    if (task.state === "DRAFT" && task.draftStep === "SelectAnswers") {
      await this.tasksRepository.updateDraftStep(task.id.toString(), "SelectImages");
    }
  }
}
