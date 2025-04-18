import { ClientCreate } from "@/domain/users/application/use-cases/client/register-client";
import { Client } from "@/domain/users/enterprise/client";

export class ClientPresenter {
  static toHTTP(client: ClientCreate) {
    return {
      id: client.id.toString(),
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      phone_number: client.phoneNumber,
      is_email_validated: client.isEmailValidated,
      is_phone_number_validated: client.isPhoneNumberValidated,
      user_id: client.userId.toString(),
    };
  }
}
export class ClientDefaultPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toString(),
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      born_at: client.bornAt,
      gender: client.gender,
      phone_number: client.phoneNumber,
      is_email_validated: client.isEmailValidated,
      is_phone_number_validated: client.isPhoneNumberValidated,
      user_id: client.userId.toString(),
    };
  }
}
