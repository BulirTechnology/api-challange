import { Pagination, PaginationParams } from "@/core/repositories/pagination-params";
import { Specialization } from "../../enterprise/specialization";

export abstract class SpecializationsRepository {
  abstract deleteManyOfSp(params: {serviceProviderId: string}): Promise<void>
  abstract findById(id: string): Promise<Specialization | null>
  abstract findByServiceProviderId(serviceProviderId: string): Promise<Specialization | null>
  abstract findByServiceIdAndServiceProviderId(params: {
    serviceId: string
    serviceProviderId: string
  }): Promise<Specialization | null>
  abstract create(client: Specialization): Promise<Specialization>
  abstract update(id: string, client: Specialization): Promise<Specialization>
  abstract deleteById(id: string): Promise<void>
  abstract findMany(params: PaginationParams & { serviceProviderId: string }): Promise<Pagination<Specialization>>
}
