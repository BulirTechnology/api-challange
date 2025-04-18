import { ClientServiceProviderFavorite } from "@/domain/users/enterprise/client-service-provider-favorite";

export class ClientServiceProviderFavoritePresenter {
  static toHTTP(favorite: ClientServiceProviderFavorite) {
    return {
      id: favorite.id.toString(),
      first_name: favorite.clientId.toString(),
      last_name: favorite.serviceProviderId.toString(),
      email: favorite.updatedAt,
      born_at: favorite.createdAt,
    };
  }
}