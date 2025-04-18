import { AddressProps } from "@/domain/users/enterprise";

export interface UserDTO {
  id: string;
  fullName: string | undefined;
  email: string;
  telephone: string | undefined;
  status: string;
  rating: number | undefined;
  address: AddressProps | undefined;
}
