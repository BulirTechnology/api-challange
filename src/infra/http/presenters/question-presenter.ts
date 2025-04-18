import { Question } from "@/domain/work/enterprise/questions";

export class QuestionPresenter {
  static toHTTP(question: Question, storageUrl: string) {
    return {
      id: question.id.toString(),
      title: question.title,
      type: question.type,
      service_id: question.serviceId.toString(),
      options: question.options?.map(option => ({
        id: option.id.toString(),
        value: question.type === "SINGLE_SELECT_IMAGE" ?
          option.value ? storageUrl + option.value
            :
            option.value
          :
          option.value
      })),
      state: question.state,
      created_at: question.createdAt,
      updated_at: question.updatedAt
    };
  }
}