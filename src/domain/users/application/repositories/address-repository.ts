import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { Address } from "../../enterprise/address";

export abstract class AddressesRepository {
  abstract findMany(params: PaginationParams & { userId: string }): Promise<Pagination<Address>>
  abstract findById(id: string): Promise<Address | null>
  abstract delete(id: string): Promise<void>
  abstract create(address: Address): Promise<Address>
  abstract update(id: string, address: Address): Promise<void>
  abstract setAsPrimary(addressId: string, userId: string): Promise<void>
}
