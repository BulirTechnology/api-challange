import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { AccountAlreadyExistsError } from "../errors/account-already-exists-error";
import { UsersRepository } from "../../repositories/user-repository";
import { ResourceNotFoundError } from "@/core/errors";
import { ClientsRepository } from "../../repositories/client-repository";
import { ServiceProvidersRepository } from "../../repositories/service-provider-repository";
import { Client } from "../../../enterprise/client";
import { ServiceProvider } from "../../../enterprise/service-provider";

interface UpdateUserProfileCaseRequest {
  language: "en" | "pt"
  userId: string
  firstName: string
  lastName: string
  aboutMe?: string
  bornAt: Date
  gender: "Male" | "Female" | "NotTell"
  profileUrl: string | null
}

type UpdateUserProfileCaseResponse = Either<
  AccountAlreadyExistsError,
  {
    message: string
  }
>

@Injectable()
export class UpdateUserProfileCase {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRepository: ClientsRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
  ) { }

  async execute({
    userId,
    bornAt,
    firstName,
    gender,
    lastName,
    profileUrl,
    aboutMe
  }: UpdateUserProfileCaseRequest): Promise<UpdateUserProfileCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("Account not found"));
    }

    if (user.accountType === "Client") {
      const existentClient = await this.clientsRepository.findByEmail(user.email);
      if (!existentClient) {
        return left(new ResourceNotFoundError("Client not found"));
      }

      const client = Client.create({
        bornAt,
        firstName,
        gender,
        lastName,
        phoneNumber: user.phoneNumber,
        state: existentClient.state,
        email: existentClient.email,
        userId: user.id,
        isEmailValidated: existentClient.isEmailValidated,
        isPhoneNumberValidated: existentClient.isPhoneNumberValidated
      }, existentClient.id);

      await this.clientsRepository.update(existentClient.id.toString(), client);
    } else if (user.accountType === "ServiceProvider") {
      const existentServiceProvider = await this.serviceProviderRepository.findByEmail(user.email);
      if (!existentServiceProvider) {
        return left(new ResourceNotFoundError("ServiceProvider not found"));
      }

      const serviceProvider = ServiceProvider.create({
        bornAt,
        firstName,
        gender,
        lastName,
        phoneNumber: existentServiceProvider.phoneNumber,
        state: existentServiceProvider.state,
        email: existentServiceProvider.email,
        userId: existentServiceProvider.id,
        description: aboutMe ? aboutMe : existentServiceProvider.description,
        education: existentServiceProvider.education,
        isApproved: existentServiceProvider.isApproved,
        isFavorite: false,
        isEmailValidated: existentServiceProvider.isApproved,
        profileUrl: "",
        isPhoneNumberValidated: existentServiceProvider.isPhoneNumberValidated,
        hasBudget: existentServiceProvider.hasBudget,
        hasCertificateByBulir: existentServiceProvider.hasCertificateByBulir,
        rating: existentServiceProvider.rating
      }, existentServiceProvider.id);

      console.log("dados do sp em usecase: ", serviceProvider);

      await this.serviceProviderRepository.update(serviceProvider);
    }

    if (profileUrl) {
      await this.usersRepository.updateProfileImage({
        userId: user.id.toString(),
        profileUrl
      });
    }

    return right({
      message: "Profile updated",
    });
  }
}
