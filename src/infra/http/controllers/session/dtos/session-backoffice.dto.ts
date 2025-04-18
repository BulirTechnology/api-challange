import { ApiProperty } from "@nestjs/swagger";
import { SessionBackofficeSchema } from "../session-backoffice.controller";

export class SesionBackofficeDTO implements SessionBackofficeSchema {
  @ApiProperty({
    description: "Tipo de conta",
    enum: ["SuperAdmin"],
    example: "SuperAdmin",
  })
  account_type!: "SuperAdmin";

  @ApiProperty({
    description: "E-mail do usuário",
    example: "user@example.com",
  })
  email!: string;

  @ApiProperty({
    description: "Senha do usuário",
    example: "senha123",
  })
  password!: string;

  @ApiProperty({
    description: "Manter usuário autenticado",
    example: false,
  })
  remember_me!: boolean;
}
