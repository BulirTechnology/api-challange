import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { Question, QuestionOptions, QuestionState } from "../../enterprise/questions";

export abstract class QuestionsRepository {
  abstract findByTitle(title: string): Promise<Question | null>
  abstract findByTitleAndService(params: { title: string, serviceId: string }): Promise<Question | null>
  abstract findMany(params: PaginationParams & { serviceId: string }): Promise<Pagination<Question>>
  abstract findById(id: string): Promise<Question | null>
  abstract create(question: Question): Promise<Question>
  abstract addOption(data: { questionId: string, options: QuestionOptions[] }): Promise<void>
  abstract updateState(questionId: string, state: QuestionState): Promise<void>
  abstract updateService(questionId: string, serviceId: string): Promise<void>
}
