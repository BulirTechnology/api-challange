import { WrongCredentialsError } from "../../../errors/wrong-credentials-error";

import { HashComparator } from "@/domain/users/application/cryptography";
import { User } from "@/domain/users/enterprise";

export async function handleCanAuthentication({
  hashComparator,
  password,
  user,
  validateWithPassword
}: {
  user: User,
  password: string,
  hashComparator: HashComparator,
  validateWithPassword: boolean
}) {
  /*  if (user.isAuthenticated) {
        return left(new UserAlreadyAuthenticatedError());
      } */

  const isPasswordValid = await hashComparator.compare(
    password,
    user.password
  );

  if (!isPasswordValid && validateWithPassword) {
    return new WrongCredentialsError();
  }

  return true
}