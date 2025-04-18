import { Public } from "@/infra/auth/public";
import {
  Body,
  Controller,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("push-notifications")
@Controller("/push-notifications")
@Public()
export class PushNotificationTokenController {
  constructor(
  ) { }
 
  @Post()
  async handle(
    @Body("token") token: string
  ) {
    console.log("push token: ", token);
  }
}
