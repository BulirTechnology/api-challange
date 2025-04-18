import { Document } from "../../enterprise/document";

export abstract class DocumentRepository {
  abstract create(document: Document): Promise<void>
  abstract findByUserIdAndType(serviceProviderId: string, type: "NIF" | "BI_FRONT"): Promise<Document | null>
}
