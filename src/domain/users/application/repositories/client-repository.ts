import { Pagination } from "@/core/repositories/pagination-params";
import { Client } from "../../enterprise/client";

export abstract class ClientsRepository {
  abstract findById(id: string): Promise<Client | null>
  abstract findByEmail(email: string): Promise<Client | null>
  abstract findByPhoneNumber(phoneNumber: string): Promise<Client | null>
  abstract findMany(params: { page: number, name: string, perPage?: number }): Promise<Pagination<Client>>
  abstract create(client: Client): Promise<Client>
  abstract update(clientId: string, client: Client): Promise<void>
  abstract findNewQuotations(params: { clientId: string, jobId: string }): Promise<number>
}
