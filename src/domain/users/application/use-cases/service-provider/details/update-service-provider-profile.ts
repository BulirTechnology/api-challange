import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "@/core/errors";

import {
  Address,
  EducationLevel,
  LanguageSlug,
  Skill,
  ServiceProvider
} from "@/domain/users/enterprise";

import {
  AddressesRepository,
  ServiceProvidersRepository,
  UsersRepository,
  PortfoliosRepository,
  SpecializationsRepository
} from "../../../repositories";

import { checkNextStep } from "../../user/authentication/helper/setup-next-step";

interface UpdateServiceProviderProfileUseCaseRequest {
  language: LanguageSlug
  userId: string
  data: {
    skills: string[]
    education: EducationLevel,
    description: string,
    address: {
      id: string
      name: string;
      line1: string;
      line2: string;
      latitude: number;
      longitude: number;
    } | null
    profileUrl: string | null
  }
}

type UpdateServiceProviderProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    message: string
    nextStep?: "PersonalInfo" | "Services" | "Portfolio"
  }
>

@Injectable()
export class UpdateServiceProviderProfileUseCase {
  constructor(
    private userRepository: UsersRepository,
    private serviceProviderRepository: ServiceProvidersRepository,
    private addressRepository: AddressesRepository,
    private specializationsRepository: SpecializationsRepository,
    private portfoliosRepository: PortfoliosRepository,
  ) { }

  async execute({
    data,
    userId
  }: UpdateServiceProviderProfileUseCaseRequest): Promise<UpdateServiceProviderProfileUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError("User register not found"));
    }

    const serviceProvider = await this.serviceProviderRepository.findByEmail(user.email);

    if (!serviceProvider) {
      return left(new ResourceNotFoundError("Service Provider register not found"));
    }

    const updatedServiceProvider = ServiceProvider.create({
      bornAt: serviceProvider.bornAt,
      description: data.description,
      education: data.education,
      email: serviceProvider.email,
      firstName: serviceProvider.firstName,
      gender: serviceProvider.gender,
      lastName: serviceProvider.lastName,
      phoneNumber: serviceProvider.phoneNumber,
      userId: serviceProvider.userId,
      state: serviceProvider.state,
      profileUrl: "",
      isFavorite: false,
      hasBudget: serviceProvider.hasBudget,
      hasCertificateByBulir: serviceProvider.hasCertificateByBulir,
      rating: serviceProvider.rating
    }, serviceProvider.id);

    //update the description and education
    await this.serviceProviderRepository.update(updatedServiceProvider);

    //update the skills
    for (const currentSkill of data.skills) {
      const alreadyHaveThisSkill =
        await this.serviceProviderRepository.findSkill({
          skill: currentSkill,
          serviceProviderId: serviceProvider.id.toString()
        });

      if (alreadyHaveThisSkill) continue;

      const skill = Skill.create({
        name: currentSkill,
      });

      await this.serviceProviderRepository.createSkill({
        serviceProviderId: serviceProvider.id.toString(),
        skill
      });
    }

    //update the address
    if (data.address) {
      const addressAdded = await this.addressRepository.findById(data.address.id);

      if (addressAdded) {
        const address = Address.create({
          isPrimary: true,
          latitude: data.address.latitude,
          line1: data.address.line1,
          line2: data.address.line2,
          longitude: data.address.longitude,
          name: data.address.name,
          userId: serviceProvider.userId,
        }, addressAdded.id);
        await this.addressRepository.update(data.address.id, address);
      }
    }

    if (data.profileUrl) {
      await this.userRepository.updateProfileImage({
        userId: user.id.toString(),
        profileUrl: data.profileUrl
      });
    }

    let nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;
    if (user.state === "SetupAccount") {
      nextStep = await checkNextStep(
        user,
        updatedServiceProvider,
        this.specializationsRepository,
        this.portfoliosRepository
      );
    }

    return right({
      message: "Updated the specialization repository",
      nextStep
    });
  }
}
