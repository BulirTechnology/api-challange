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
  WayToWorkMap,
  AgeGroupMap
} from "@/domain/inquire/enterprise";

@ApiTags("Inquire")
@Controller("/inquires")
@Public()
export class DownloadSpInquiredController {
  constructor(
    private fetchInquire: FetchInquireUseCase,
  ) { }

  @Get("sps")
  @ApiResponse({ status: 200, description: "Successful response" })
  async handle(@Res() res: Response) {
    const response = await this.fetchInquire.execute();

    const data: {
      'Age Group',
      'Email Or Number',
      'City',
      'Address',
      'Preferred Services',
      'Way to Work',
      'Created At'
    }[] = []

    for (let i = 0; i < (response.value?.serviceProviders ?? []).length; i++) {
      const sp = response.value?.serviceProviders[i]

      data.push({
        "Age Group": AgeGroupMap[sp?.ageGroup ?? "from16To24"],
        "Email Or Number": sp?.emailOrNumber,
        City: sp?.city,
        'Address': sp?.whereLeave,
        "Preferred Services": sp?.preferredServices.toString(),
        "Way to Work": WayToWorkMap[sp?.wayToWork ?? "workAsFreelancer"],
        "Created At": sp?.createdAt.toDateString(),
      })
    }

    const result = json2csv(data, {})
    res.header('Content-Type', 'text/csv');
    res.attachment('sp_inquires.csv');
    res.send(result);
  }
}