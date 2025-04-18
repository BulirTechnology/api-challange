import { FetchInquireUseCase } from "@/domain/inquire/application/use-cases/fetch-inquire";
import { Public } from "@/infra/auth/public";
import {
  Controller,
  Get,
} from "@nestjs/common";

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Inquire")
@Controller("/inquires")
@Public()
export class ListInquireController {
  constructor(
    private fetchInquire: FetchInquireUseCase,
  ) { }

  @Get()
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle() {
    const response = await this.fetchInquire.execute();

    return {
      service_providers: response.value?.serviceProviders,
      clients: response.value?.clients
    };
  }
}