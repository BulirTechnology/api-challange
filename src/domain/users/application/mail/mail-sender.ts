export abstract class MailSender {
  abstract send(data: {
    to: string,
    subject: string,
    body: unknown
    templateName?: string
    variable: unknown
  }): Promise<void>
}