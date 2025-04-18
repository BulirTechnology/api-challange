export abstract class OTPGenerator {
  abstract generate(): Promise<string>
}