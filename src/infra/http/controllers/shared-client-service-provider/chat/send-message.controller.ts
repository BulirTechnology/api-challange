import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AuthPayload } from "@/infra/auth/jwt.strategy";
import { AuthenticatedUser } from "@/infra/auth/authenticated-user-decorator";
import { SaveMessageUseCase } from "@/domain/work/application/use-case/conversation/save-message";
import { z } from "zod";
import { MessagePresenter } from "@/infra/http/presenters/message.presenter";

const sendMessageBodySchema = z.object({
  message: z.string({
    invalid_type_error: "user.email.invalid_type_error",
    required_error: "user.email.invalid_type_error"
  })
});

type SendMessageBodySchema = z.infer<typeof sendMessageBodySchema>


@ApiTags("Chat")
@Controller("/conversations")
@UseGuards(JwtAuthGuard)
export class SendMessageController {
  constructor(
    private saveMessageUseCase: SaveMessageUseCase
  ) { }
 
  @Post(":conversationId/messages")
  async handle(
    @AuthenticatedUser() user: AuthPayload,
    @Body() data: SendMessageBodySchema,
    @Param("conversationId") conversationId: string
  ) {
    const result = await this.saveMessageUseCase.execute({
      userId: user.sub,
      content: data.message,
      conversationId
    });
    console.log("result message created: ", result);
    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return {
      message: MessagePresenter.toHTTP(result.value?.message)
    };
  }

}