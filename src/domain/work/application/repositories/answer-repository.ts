import { Answer } from "../../enterprise/answer";
import { AnswerPaginationParams } from "../params/answer-params";

export abstract class AnswersRepository {
  abstract findMany(params: AnswerPaginationParams): Promise<Answer[]>
  abstract findById(id: string): Promise<Answer | null>
  abstract create(answer: Answer): Promise<void>
  abstract delete(taskId: string, questionId: string): Promise<void>
}
