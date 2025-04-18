import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface ClientServiceProviderFavoriteProps {
  clientId: UniqueEntityID
  serviceProviderId: UniqueEntityID
  createdAt?: Date | null
  updatedAt?: Date | null
}

export class ClientServiceProviderFavorite extends Entity<ClientServiceProviderFavoriteProps> {
  get clientId() {
    return this.props.clientId;
  }
  get serviceProviderId() {
    return this.props.serviceProviderId;
  }
  get createdAt(){
    return this.props.createdAt;
  }
  get updatedAt(){
    return this.props.updatedAt;
  }

  static create(props: ClientServiceProviderFavoriteProps, id?: UniqueEntityID) {
    const client = new ClientServiceProviderFavorite(props, id);

    return client;
  }
}
