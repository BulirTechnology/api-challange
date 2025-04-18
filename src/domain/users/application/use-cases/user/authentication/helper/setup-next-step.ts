import {
  PortfoliosRepository,
  SpecializationsRepository
} from "@/domain/users/application/repositories";

import {
  User,
  ServiceProvider
} from "@/domain/users/enterprise";

export async function checkNextStep(
  user: User,
  sp: ServiceProvider,
  specializationsRepository: SpecializationsRepository,
  portfoliosRepository: PortfoliosRepository,
): Promise<"PersonalInfo" | "Services" | "Portfolio" | undefined> {
  if (user.state !== "SetupAccount") {
    return undefined;
  }

  if (!sp.description || !sp.education) return "PersonalInfo";

  const specialization = await specializationsRepository.findByServiceProviderId(sp.id.toString());

  if (!specialization) return "Services";

  const portfolio = await portfoliosRepository.findMany({
    serviceProviderId: sp.id.toString(),
    page: 1
  });

  if (portfolio.data.length <= 0) return "Portfolio";

  return undefined;
}