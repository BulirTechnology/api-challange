import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import { FileDispute } from "../../../enterprise";
import {
  FileDisputeRepository,
  FileDisputeReasonRepository,
  BookingsRepository,
} from "../../repositories";

import {
  UsersRepository,
  ClientsRepository,
  ServiceProvidersRepository,
} from "@/domain/users/application/repositories";
import { LanguageSlug } from "@/domain/users/enterprise";

import { getUserIdByAccountType } from "./helper/get-user-id-by-account-type";
import { isBookingRelatedToUser } from "./helper/get-is-booking-of-this-user";

interface StartFileDisputeRequest {
  language: LanguageSlug;
  userId: string;
  bookingId: string;
  fileDisputeReasonId: string;
  description: string;
}

type StartFileDisputeResponse = Either<ResourceNotFoundError, null>;

@Injectable()
export class StartFileDisputeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private serviceProvidersRepository: ServiceProvidersRepository,
    private fileDisputeRepository: FileDisputeRepository,
    private fileDisputeReasonRepository: FileDisputeReasonRepository,
    private bookingsRepository: BookingsRepository
  ) { }

  async execute({
    bookingId,
    description,
    fileDisputeReasonId,
    userId,
    language,
  }: StartFileDisputeRequest): Promise<StartFileDisputeResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    const accountType = user.accountType;
    const userEmail = user.email;

    const userRelatedId = await getUserIdByAccountType({
      accountType,
      email: userEmail,
      clientsRepository: this.clientsRepository,
      serviceProvidersRepository: this.serviceProvidersRepository
    });

    if (!userRelatedId)
      return left(new ResourceNotFoundError(`${accountType} not found`));

    const fileDisputeReason = await this.fileDisputeReasonRepository.findById({
      id: fileDisputeReasonId,
      language,
    });

    if (!fileDisputeReason) {
      return left(new ResourceNotFoundError("File dispute reason not found"));
    }

    const booking = await this.bookingsRepository.findById(bookingId);

    if (!booking)
      return left(new ResourceNotFoundError("Booking not found"));

    const isRelatedToUser = isBookingRelatedToUser({
      booking,
      clientOrSpId: userRelatedId,
      accountType
    })

    if (!isRelatedToUser)
      return left(new ResourceNotFoundError("There is no booking associated with this id"));

    const fileDispute = FileDispute.create({
      status: "PENDING",
      userId: user.id,
      description,
      fileDisputeReasonId: fileDisputeReason.id,
      bookingId: booking.id,
      resolutionComment: null,
      resolutionDate: null,
      fileDisputeReason: "",
    });

    await this.bookingsRepository.updateState(booking.id.toString(), "DISPUTE");
    await this.bookingsRepository.updateRequestWorkState(
      booking.id.toString(),
      "DISPUTE"
    );
    await this.fileDisputeRepository.create(fileDispute);

    return right(null);
  }
}
