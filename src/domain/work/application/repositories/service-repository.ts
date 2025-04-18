import { Pagination } from "@/core/repositories/pagination-params";
import { Service } from "../../enterprise/service";
import {
  ServiceFindById,
  ServiceManyBySubCategory,
  ServicePaginationParams
} from "../params/service-params";

export abstract class ServicesRepository {
  abstract findByTitle(title: string): Promise<Service | null>
  abstract findMany(params: ServicePaginationParams): Promise<Pagination<Service>>
  abstract findManyByCategory(params: { categoryId: string, page: number, perPage?: number }): Promise<Pagination<Service>>
  abstract findManyBySubCategory(params: ServiceManyBySubCategory): Promise<Pagination<Service>>
  abstract findById(params: ServiceFindById): Promise<Service | null>
  abstract create(service: Service): Promise<Service | null>
  abstract update(service: Service, language: "pt" | "en"): Promise<Service>
}
