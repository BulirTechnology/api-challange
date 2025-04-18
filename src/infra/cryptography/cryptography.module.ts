import { Module } from "@nestjs/common";
import { JwtEncrypter } from "./jwt-encrypter";
import { BcryptHasher } from "./bcrypt-hasher";
import { HashGenerator } from "@/domain/users/application/cryptography/hash-generator";
import { HashComparator } from "@/domain/users/application/cryptography/hash-comparator";
import { Encrypter } from "@/domain/users/application/cryptography/encrypter";
import { OTPGenerator } from "@/domain/users/application/cryptography/otp-generator";
import { BasicOtpGenerator } from "./basic-opt-generator";
import { EnvService } from "../environment/env.service";

@Module({
  providers: [
    EnvService,
    {
      provide: Encrypter,
      useClass: JwtEncrypter
    },
    {
      provide: HashComparator,
      useClass: BcryptHasher
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher
    },
    {
      provide: OTPGenerator,
      useClass: BasicOtpGenerator
    },
  ],
  exports: [
    OTPGenerator,
    Encrypter,
    HashComparator,
    HashGenerator
  ]
})
export class CryptographyModule {}