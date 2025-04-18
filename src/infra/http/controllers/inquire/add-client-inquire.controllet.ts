import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { z } from "zod";
import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { ValidationService } from "@/infra/http/pipes/validation.service";
import { AddClientInquireUseCase } from "@/domain/inquire/application/use-cases/client/add-client-inquire";
import { Public } from "@/infra/auth/public";

const LuandaCity = z.enum([
  "Outro",
  "IcoloBengo",
  "Luanda",
  "Quicama",
  "Cacuaco",
  "Cazenga",
  "Viana",
  "Belas",
  "KilambaKiaxi",
  "Talatona"
]);

const AgeGroup = z.enum([
  "from16To24",
  "from25To34",
  "from35To44",
  "from45To54",
  "from55To64",
  "from65OrMore"
]);

const SpendOnServices = z.enum([
  "from3000To9000",
  "from10000To19000",
  "from20000To39000",
  "from40000OrMore"
]);

const WayFindServiceProvider = z.enum([
  "fromFriendsOrTrustedPeople",
  "fromFamilyRecommendation",
  "fromAnyoneRecommendation",
  "fromInternetSearch",
  "other"
]);

const addPaymentMethodBodySchema = z.object({
  email_or_number: z.string().refine(value => {
    if (/^\S+@\S+\.\S+$/.test(value)) return true;
    if (/^9\d{8}$/.test(value)) return true;
    return false;
  }, {
    message: "Deve ser um endereço de e-mail válido ou um número no formato de Angola."
  }),
  city: LuandaCity,
  where_leave: z.string(),
  age_group: AgeGroup,
  preferred_services: z.array(z.string()),
  spend_on_services: SpendOnServices,
  way_find_service_provider: WayFindServiceProvider,

});

type AddClientInquireBodySchema = z.infer<typeof addPaymentMethodBodySchema>

@ApiTags("Inquire")
@Controller("/inquires")
@Public()
export class AddClientInquireController {
  constructor(
    private addClientInquireUseCase: AddClientInquireUseCase,
    private validation: ValidationService
  ) { }

  @Post("clients")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(
    @Body() data: AddClientInquireBodySchema
  ) {
    try {
      await this.validation.validateData(addPaymentMethodBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.addClientInquireUseCase.execute({
      client: {
        ageGroup: data.age_group,
        city: data.city,
        emailOrNumber: data.email_or_number,
        preferredServices: data.preferred_services,
        spendOnServices: data.spend_on_services,
        wayFindServiceProvider: data.way_find_service_provider,
        whereLeave: data.where_leave,
        createdAt: new Date(),

      }
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException(error.message);

      throw new BadRequestException();
    }

    return {
      message: "Operação terminada com sucesso!"
    };
  }
}