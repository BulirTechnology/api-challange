import { FetchInquireUseCase } from "@/domain/inquire/application/use-cases/fetch-inquire";
import { Public } from "@/infra/auth/public";
import {
  Controller,
  Get,
  Res,
} from "@nestjs/common";
import { json2csv } from 'json-2-csv';

import {
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { Response } from "express";
import {
  AgeGroupMap,
  SpendOnServicesMap,
  WayFindServicesProviderMap
} from "@/domain/inquire/enterprise";

@ApiTags("Inquire")
@Controller("/inquires")
@Public()
export class DownloadClientInquiredController {
  constructor(
    private fetchInquire: FetchInquireUseCase,
  ) { }

  @Get("clients")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(@Res() res: Response) {
    const response = await this.fetchInquire.execute();

    const data: {
      'Age Group',
      'Email Or Number',
      'City',
      'Address',
      'Preferred Services',
      'Spend on Services',
      'Way to find SP',
      "Created At"
    }[] = []

    for (let i = 0; i < (response.value?.clients ?? []).length; i++) {
      const client = response.value?.clients[i]
      data.push({
        "Age Group": AgeGroupMap[client?.ageGroup ?? "from16To24"],
        "Email Or Number": client?.emailOrNumber,
        City: client?.city,
        'Address': client?.whereLeave,
        "Preferred Services": client?.preferredServices.toString(),
        "Spend on Services": SpendOnServicesMap[client?.spendOnServices ?? "from10000To19000"],
        "Way to find SP": WayFindServicesProviderMap[client?.wayFindServiceProvider ?? "fromAnyoneRecommendation"],
        "Created At": client?.createdAt.toDateString(),
      })
    }

    const result = json2csv(data, {})

    res.header('Content-Type', 'text/csv');
    res.attachment('client_inquires.csv');
    res.send(result);
  }
}