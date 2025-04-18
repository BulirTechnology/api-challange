import { AccountType, GenderProps, User } from "@/domain/users/enterprise";

import { checkNextStep } from "./setup-next-step";

import {
  ClientsRepository,
  ServiceProvidersRepository,
  SpecializationsRepository,
  PortfoliosRepository,
} from "@/domain/users/application/repositories";

export async function handleGetProfileDetails({
  accountType,
  email,
  user,
  clientRepository,
  serviceProviderRepository,
  specializationsRepository,
  portfoliosRepository,
}: {
  accountType: AccountType;
  email: string;
  user: User;
  clientRepository: ClientsRepository;
  serviceProviderRepository?: ServiceProvidersRepository;
  specializationsRepository?: SpecializationsRepository;
  portfoliosRepository?: PortfoliosRepository;
}) {
  let profileId = "",
    firstName = "",
    lastName = "",
    description = "",
    education = "",
    nextStep: "PersonalInfo" | "Services" | "Portfolio" | undefined = undefined;

  let bornAt: Date | null = null;
  let gender: GenderProps = "NotTell";

  if (accountType === "Client") {
    const client = await clientRepository.findByEmail(email);
    if (client) {
      profileId = client?.id.toString();
      firstName = client?.firstName;
      lastName = client?.lastName;
      gender = client.gender ?? "NotTell";
      bornAt = client.bornAt;
    }
  } else {
    const sp = await serviceProviderRepository?.findByEmail(email);
    if (sp) {
      profileId = sp?.id.toString();
      firstName = sp?.firstName;
      lastName = sp?.lastName;
      gender = sp.gender ?? "NotTell";
      bornAt = sp.bornAt;
      description = sp.description;
      education = sp.education;

      if (user.state === "SetupAccount") {
        nextStep = await checkNextStep(
          user,
          sp,
          specializationsRepository!,
          portfoliosRepository!
        );
      }
    }
  }

  return {
    profileId,
    firstName,
    lastName,
    gender,
    bornAt,
    description,
    education,
    nextStep,
  };
}
