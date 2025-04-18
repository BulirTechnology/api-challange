import { Injectable } from "@nestjs/common";
import {
  Either,
  left,
  right
} from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { Transaction } from "../../enterprise";
import { TransactionRepository } from "../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
interface FetchUserTransactionDetailsUseCaseRequest {
  transactionId: string
  language: LanguageSlug
}

type FetchUserTransactionDetailsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    transaction: Transaction
  }
>

@Injectable()
export class FetchUserTransactionDetailsUseCase {
  constructor(private transactionsRepository: TransactionRepository) { }

  async execute({
    transactionId,
    language
  }: FetchUserTransactionDetailsUseCaseRequest): Promise<FetchUserTransactionDetailsUseCaseResponse> {
    const transaction = await this.transactionsRepository.findById(transactionId, language);

    if (!transaction) {
      return left(new ResourceNotFoundError(""));
    }

    return right({
      transaction
    });
  }
}
