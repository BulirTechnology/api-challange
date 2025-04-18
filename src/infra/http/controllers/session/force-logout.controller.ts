import {
  Body,
  Controller,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { z } from "zod";

import { Public } from "@/infra/auth/public";
import { ZodValidationPipe } from "../../pipes/zod-validation-pipe";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

const forceLogoutBodyBodySchema = z.object({
  user_id: z.string({ required_error: "Informe id do usuario" }),
});

type ForceLogoutBodySchema = z.infer<typeof forceLogoutBodyBodySchema>

@ApiTags("Sessions")
@Controller("/sessions")
@Public()
export class ForceLogoutController {
  constructor(
    private prisma: PrismaService
  ) { }

  @Post("force_logout")
  @UsePipes(new ZodValidationPipe(forceLogoutBodyBodySchema))
  async handle(@Body() data: ForceLogoutBodySchema) {
    const { user_id } = data;

    await this.prisma.user.updateMany({
      where: {
        id: user_id
      },
      data: {
        isAuthenticated: false
      }
    });

    
  }
}
