import { Address } from "@/domain/users/enterprise/address";

export class AddressPresenter {
  static toHTTP(address: Address) {
    return {
      id: address.id.toString(),
      name: address.name,
      is_primary: address.isPrimary,
      line1: address.line1,
      line2: address.line2,
      latitude: address.latitude,
      longitude: address.longitude,
      created_at: address.createdAt,
      updated_at: address.updatedAt
    };
  }
}