export type EncrypterResponse = {
  accessToken: string
  refreshToken: string
}

export abstract class Encrypter {
  abstract encrypt(payload: Record<string, unknown>, rememberMe: boolean): Promise<EncrypterResponse>
}