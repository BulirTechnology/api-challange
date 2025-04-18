import {
  ClientsRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { AccountType } from "@/domain/users/enterprise";

export async function getUserIdByAccountType({
  accountType,
  email,
  clientsRepository,
  serviceProvidersRepository
}: {
  accountType: AccountType,
  email: string,
  clientsRepository: ClientsRepository,
  serviceProvidersRepository: ServiceProvidersRepository
}): Promise<string | null> {
  if (accountType === "Client") {
    const client = await clientsRepository.findByEmail(email);

    return client ? client.id.toString() : null;
  } else if (accountType === "ServiceProvider") {
    const serviceProvider = await serviceProvidersRepository.findByEmail(email);

    return serviceProvider ? serviceProvider.id.toString() : null;
  }

  return null;
}