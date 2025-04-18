import { Pagination } from "@/core/repositories/pagination-params";
import { ServiceProvider } from "../../enterprise/service-provider";

export abstract class ClientServiceProviderFavoriteRepository {
  abstract findMany(params: { clientId: string, page: number, perPage?: number }): Promise<Pagination<ServiceProvider>>
  abstract createOrDelete(clientId: string, serviceProviderId: string): Promise<void>
  abstract isFavorite(params: {clientId: string, serviceProviderId: string}): Promise<boolean>
}
 