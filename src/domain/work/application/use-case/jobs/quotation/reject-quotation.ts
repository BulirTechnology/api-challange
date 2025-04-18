import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UsersRepository,
  ClientsRepository,
  NotificationsRepository,
  ServiceProvidersRepository,
  PushNotificationRepository
} from "@/domain/users/application/repositories";

import { LanguageSlug } from "@/domain/users/enterprise";

import {
  JobsRepository,
  QuotationsRepository
} from "../../../repositories";

import { SocketGateway } from "@/infra/websocket/socket.gateway";
import { processI18nMessage } from "@/i18n/helper/process-i18n-message";
import {
  createNotificationRegister
} from "@/domain/notification/application/use-case/helper/create-notification-register";

interface RejectQuotationUseCaseRequest {
  language: LanguageSlug
  userId: string,
  jobId: string
  quotationId: string
  reasonId: string
  description: string
}

type RejectQuotationUseCaseResponse = Either<
  ResourceNotFoundError,
  null
>

@Injectable()
export class RejectQuotationUseCase {
  constructor(
    private userRepository: UsersRepository,
    private clientRepository: ClientsRepository,
    private jobsRepository: JobsRepository,
    private quotationsRepository: QuotationsRepository,
    private notificationRepository: NotificationsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private readonly i18n: I18nService,
    private readonly socketGateway: SocketGateway,
    private readonly pushNotificationRepository: PushNotificationRepository
  ) { }

  async execute({
    userId,
    jobId,
    quotationId,
    description,
    reasonId
  }: RejectQuotationUseCaseRequest): Promise<RejectQuotationUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.not_found")));
    }

    const client = await this.clientRepository.findByEmail(user.email);

    if (!client) {
      return left(new ResourceNotFoundError(processI18nMessage(this.i18n, "errors.user.client_not_found")));
    }

    const job = await this.jobsRepository.findById({
      accountType: "Client",
      id: jobId,
      userId
    });

    if (!job) {
      return left(new ResourceNotFoundError(
        processI18nMessage(this.i18n, "errors.job.not_found"
        )));
    }

    if (job.clientId.toString() != client.id.toString()) {
      return left(new ResourceNotFoundError(
        processI18nMessage(this.i18n, "errors.job.not_found",
        )));
    }

    const quotation = await this.quotationsRepository.findById(quotationId);

    if (quotation?.jobId.toString() !== job.id.toString()) {
      return left(new ResourceNotFoundError(
        processI18nMessage(this.i18n, "errors.quotation.not_found",
        )));
    }

    const serviceProvider = await this.serviceProviderRepository.findById(quotation.serviceProviderId?.toString() + '');
    const userSp = await this.userRepository.findById(serviceProvider?.userId.toString() + "");

    await createNotificationRegister({
      descriptionPt: "A tua proposta para o trabalho foi rejeitado. Verifique e tente novamente",
      descriptionEn: "Your job proposal was rejected, please verify and try again",
      parentId: quotation.id.toString(),
      titlePt: "Proposta rejeitada",
      titleEn: "Rejected Proposal",
      type: "JobQuotedRejected",
      userId: new UniqueEntityID(serviceProvider?.userId + ""),
      language: I18nContext.current()?.lang as LanguageSlug ?? "pt",
      notificationRepository: this.notificationRepository,
      pushNotificationRedirectTo: 'QUOTATIONDETAILS',
      pushNotificationRepository: this.pushNotificationRepository
    })

    await this.quotationsRepository.rejectQuotation({
      id: quotationId,
      state: "REJECTED",
      description,
      reasonId
    });

    await this.socketGateway.notifySpClientRejectQuotation({
      quotationId: quotationId,
      socketId: userSp?.socketId + ""
    });

    return right(null);
  }
}
