import { Pagination } from "@/core/repositories/pagination-params";
import { ServiceProvider } from "../../enterprise/service-provider";
import { Skill } from "../../enterprise/skill";

export abstract class ServiceProvidersRepository {
  abstract findById(id: string): Promise<ServiceProvider | null>
  abstract findSkill(params: {
    skill: string,
    serviceProviderId: string
  }): Promise<Skill | null>
  abstract findByEmail(email: string): Promise<ServiceProvider | null>
  abstract setJobAsViewed(params: { id: string, jobId: string }): Promise<void>
  abstract countJobNotViewed(id: string): Promise<number>
  abstract findMany(params: { page: number, name?: string, perPage?: number }): Promise<Pagination<ServiceProvider>>
  abstract create(serviceProvider: ServiceProvider): Promise<ServiceProvider>
  abstract findOfService(params: {
    page: number,
    serviceId: string,
    perPage?: number,
    clientId?: string
  }): Promise<Pagination<ServiceProvider>>
  abstract createSkill(params: {
    serviceProviderId: string
    skill: Skill
  }): Promise<Skill>
  abstract update(client: ServiceProvider): Promise<void>
}
