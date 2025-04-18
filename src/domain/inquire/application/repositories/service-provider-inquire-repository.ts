import { ServiceProviderInquire } from "../../enterprise/service-provider-inquire";

export abstract class ServiceProviderInquiresRepository {
  abstract create(serviceProviderInquire: ServiceProviderInquire): Promise<void>
  abstract findMany(): Promise<ServiceProviderInquire[]>
}
