import { ClientServiceProvider } from "@/domain/users/application/use-cases/client/fetch-client-service-provider-details";

export class ClientServiceProviderPresenter {
  static toHTTP(serviceProvider: ClientServiceProvider, storageUrl: string) {
    return {
      id: serviceProvider.id.toString(),
      first_name: serviceProvider.firstName,
      last_name: serviceProvider.lastName,
      email: serviceProvider.email,
      born_at: serviceProvider.bornAt,
      gender: serviceProvider.gender,
      image1: serviceProvider.profileUrl && serviceProvider.profileUrl != "null" ? storageUrl + serviceProvider.profileUrl : null,
      phone_number: serviceProvider.phoneNumber,
      user_id: serviceProvider.userId.toString(),
      is_email_validated: serviceProvider.isEmailValidated,
      is_phone_number_validated: serviceProvider.isPhoneNumberValidated,
      is_favorite: serviceProvider.isFavorite,
      rating: serviceProvider.rating,
      has_budget: serviceProvider.hasBudget,
      has_certificate_by_bulir: serviceProvider.hasCertificateByBulir,
    };
  }
}