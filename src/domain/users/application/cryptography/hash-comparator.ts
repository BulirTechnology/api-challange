export abstract class HashComparator {
  abstract compare(plainText: string, hash: string): Promise<boolean>
}