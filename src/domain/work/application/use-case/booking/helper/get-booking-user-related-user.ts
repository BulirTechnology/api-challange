import {
  ClientsRepository,
  ServiceProvidersRepository
} from "@/domain/users/application/repositories";
import { Booking } from "@/domain/work/enterprise";

export async function getBookingRelatedUserIds({
  booking,
  clientsRepository,
  serviceProvidersRepository
}: {
  booking: Booking,
  clientsRepository: ClientsRepository,
  serviceProvidersRepository: ServiceProvidersRepository
}):
  Promise<{ clientUserId: string | null, serviceProviderUserId: string | null }> {
  const client = await clientsRepository.findById(booking.clientId.toString());
  const serviceProvider = await serviceProvidersRepository.findById(booking.serviceProviderId.toString());

  return {
    clientUserId: client?.userId.toString() + '',
    serviceProviderUserId: serviceProvider?.userId.toString() + ''
  };
}