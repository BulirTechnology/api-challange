import { Public } from "@/infra/auth/public";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("payments")
@Controller("/payments")
@Public()
export class PaymentController {
  constructor() {}
}
