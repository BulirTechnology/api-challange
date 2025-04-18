import { ClientInquire } from "../../enterprise/client-inquire";

export abstract class ClientInquiresRepository {
  abstract create(clientInquire: ClientInquire): Promise<void>
  abstract findMany(): Promise<ClientInquire[]>
}
