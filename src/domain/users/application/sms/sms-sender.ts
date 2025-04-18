export abstract class SMSSender {
  abstract send(data: { to: string, body: unknown, email?: string }): Promise<void>
}