import { AnswerJob } from "../../enterprise/answer-job";
import { AnswerJobPaginationParams } from "../params/answer-job-params";

export abstract class AnswersJobRepository {
  abstract findMany(params: AnswerJobPaginationParams): Promise<AnswerJob[]>
  abstract findById(id: string): Promise<AnswerJob | null>
  abstract create(answer: AnswerJob): Promise<AnswerJob>
}
