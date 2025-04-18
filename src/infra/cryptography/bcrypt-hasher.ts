
import { HashComparator } from "@/domain/users/application/cryptography/hash-comparator";
import { HashGenerator } from "@/domain/users/application/cryptography/hash-generator";
import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";

@Injectable()
export class BcryptHasher implements
  HashGenerator,
  HashComparator {
  compare(plainText: string, hash: string): Promise<boolean> {
    return compare(plainText, hash);
  }

  hash(plainText: string): Promise<string> {
    return hash(plainText, 8);
  }
}