import {
  Body,
  Controller,
  Post,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Headers,
} from "@nestjs/common";
import { z } from "zod";
import { RegisterServiceProviderUseCase } from "@/domain/users/application/use-cases/service-provider/register/register-service-provider";
import { AccountAlreadyExistsError } from "@/domain/users/application/use-cases/errors/account-already-exists-error";
import { Public } from "@/infra/auth/public";
import { ApiTags, ApiResponse, ApiBody, ApiOperation } from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { ServiceProviderPresenter } from "../../../presenters/service-provider-presenter";
import { EnvService } from "@/infra/environment/env.service";
import { ValidationService } from "@/infra/http/pipes/validation.service";

const createServiceProviderBodySchema = z.object({
  first_name: z.string({
    invalid_type_error: "user.first_name.invalid_type_error",
    required_error: "user.first_name.invalid_type_error",
  }),
  last_name: z.string({
    invalid_type_error: "user.last_name.invalid_type_error",
    required_error: "user.last_name.invalid_type_error",
  }),
  referred_by: z
    .string({
      invalid_type_error: "user.referred_by.invalid_type_error",
      required_error: "user.referred_by.invalid_type_error",
    })
    .optional(),
  email: z
    .string({
      invalid_type_error: "user.email.invalid_type_error",
      required_error: "user.email.invalid_type_error",
    })
    .email({
      message: "Informe um e-mail valido",
    }),
  born_at: z
    .string({
      invalid_type_error: "user.born_at.invalid_type_error",
      required_error: "user.born_at.invalid_type_error",
    })
    .pipe(z.coerce.date()),
  gender: z.enum(["Male", "Female", "NotTell"], {
    invalid_type_error: "user.gender.invalid_type_error",
    required_error: "user.gender.invalid_type_error",
  }),
  phone_number: z
    .string({
      invalid_type_error: "user.phone_number.invalid_type_error",
      required_error: "user.phone_number.invalid_type_error",
    })
    .refine((value) => {
      const angolaPhoneNumberPattern = /^9\d{8}$/;
      return angolaPhoneNumberPattern.test(value);
    }),
  address: z.object(
    {
      name: z.string({
        invalid_type_error: "address.name.invalid_type_error",
        required_error: "address.name.invalid_type_error",
      }),
      line1: z.string({
        invalid_type_error: "address.line1.invalid_type_error",
        required_error: "address.line1.invalid_type_error",
      }),
      line2: z.string({
        invalid_type_error: "address.line2.invalid_type_error",
        required_error: "address.line2.invalid_type_error",
      }),
      latitude: z.number({
        invalid_type_error: "address.latitude.invalid_type_error",
        required_error: "address.latitude.invalid_type_error",
      }),
      longitude: z.number({
        invalid_type_error: "address.longitude.invalid_type_error",
        required_error: "address.longitude.invalid_type_error",
      }),
    },
    {
      invalid_type_error: "user.address.invalid_type_error",
      required_error: "user.address.invalid_type_error",
    }
  ),
});

type CreateServiceProviderBodySchema = z.infer<
  typeof createServiceProviderBodySchema
>;

@ApiTags("Service Providers")
@Controller("/service-providers")
export class RegisterServiceProviderController {
  constructor(
    private env: EnvService,
    private registerServiceProvider: RegisterServiceProviderUseCase,
    private validation: ValidationService
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: "Register a new service provider" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        first_name: {
          type: "string",
          description: "First name of the service provider",
        },
        last_name: {
          type: "string",
          description: "Last name of the service provider",
        },
        referred_by: {
          type: "string",
          description: "ID of the user who referred the service provider",
          nullable: true,
        },
        email: {
          type: "string",
          description: "Email of the service provider",
        },
        born_at: {
          type: "string",
          format: "date",
          description: "Date of birth",
        },
        gender: {
          type: "string",
          enum: ["Male", "Female", "NotTell"],
          description: "Service provider gender",
        },
        phone_number: {
          type: "string",
          description: "Phone number of the service provider",
        },
        address: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The address name",
            },
            line1: {
              type: "string",
              description: "The address line1",
            },
            line2: {
              type: "string",
              description: "The address line2",
            },
            latitude: {
              type: "number",
              description: "The address latitude",
            },
            longitude: {
              type: "number",
              description: "The address longitude",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successful response. User account was created",
    schema: {
      type: "object",
      properties: {
        service_provider: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            gender: {
              type: "string",
              enum: ["Male", "Female"],
            },
            bornAt: {
              type: "string",
              format: "date",
            },
            userId: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        next_step: {
          type: "string",
          enum: [
            "UploadDocument",
            "SetPassword",
            "AddService",
            "ValidateEmail",
            "ValidatedPhoneNumber",
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      "Error response. Already exist an user with this email or phone number",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 409,
        },
        message: {
          type: "string",
          example: "Account already exists",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Error response. There is an error in the body property",
    schema: {
      type: "object",
      properties: {
        statusCode: {
          type: "number",
          example: 400,
        },
        message: {
          type: "string",
          description: "The main message error",
        },
        errors: {
          type: "array",
          items: {
            type: "string",
          },
          description: "The list of errors made in the body request",
        },
      },
    },
  })
  async handle(
    @Headers() headers: Record<string, string>,
    @Body() data: CreateServiceProviderBodySchema
  ) {
    try {
      await this.validation.validateData(createServiceProviderBodySchema, data);
    } catch (error) {
      throw new BadRequestException({ errors: error });
    }

    const response = await this.registerServiceProvider.execute({
      language: headers["accept-language"] == "en" ? "en" : "pt",
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email.toLowerCase(),
      phoneNumber: data.phone_number,
      bornAt: data.born_at,
      gender: data.gender,
      referredBy: data.referred_by ? data.referred_by : null,
      address: {
        latitude: data.address.latitude,
        line1: data.address.line1,
        line2: data.address.line2,
        longitude: data.address.longitude,
        name: data.address.name,
      },
    });

    if (response.isLeft()) {
      const error = response.value;

      if (error.constructor == AccountAlreadyExistsError)
        throw new ConflictException(error.message);
      else if (error.constructor == ResourceNotFoundError)
        throw new NotFoundException();

      throw new BadRequestException(error.message);
    }

    return {
      service_provider: ServiceProviderPresenter.toHTTP(
        response.value.serviceProvider,
        this.env.get("STORAGE_URL")
      ),
      next_step: response.value.nextStep,
    };
  }
}
