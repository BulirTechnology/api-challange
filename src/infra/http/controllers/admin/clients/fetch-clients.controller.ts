import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Query,
  Response,
} from "@nestjs/common";

import { ApiTags } from "@nestjs/swagger";
import { EnvService } from "@/infra/environment/env.service";
import { ResourceNotFoundError } from "@/core/errors";
import { z } from "zod";
import { Public } from "@/infra/auth/public";
import { ClientDefaultPresenter } from "@/infra/http/presenters/client-presenter";
import { FetchClientsUseCase } from "@/domain/users/application/use-cases/client/fetch-clients";
import { CacheService } from "@/infra/cache/cache.service";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );
const perPageQueryParamSchema = z
  .string()
  .optional()
  .default("1")
  .transform(Number)
  .pipe(
    z.number().min(1)
  );

const nameQueryParamSchema = z.string().optional();

type NameQueryParamSchema = z.infer<typeof nameQueryParamSchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type PerPageQueryParamSchema = z.infer<typeof perPageQueryParamSchema>

type QueryParams = {
  page: PageQueryParamSchema,
  name: NameQueryParamSchema
  per_page: PerPageQueryParamSchema
}

@ApiTags("Clients")
@Controller("/clients")
@Public()
export class FetchClientsController {
  constructor(
    private env: EnvService,
    private fetchClientsUseCase: FetchClientsUseCase,
    private cacheService: CacheService
  ) { }

  @Get()
  async handle(
    @Headers() headers: Record<string, string>,
    @Query() query: QueryParams,
    @Response() res: any
  ) {
    const startTime = process.hrtime();
    
    const language = headers["accept-language"] == "en" ? "en" : "pt";
    const page = query.page || 1;
    const perPage = isNaN(query.per_page) ? 10 : query.per_page;
    const name = query.name || "";

    const cacheKey = `clients:${page}:${perPage}:${name}:${language}`;
    
    try {
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        const endTime = process.hrtime(startTime);
        const duration = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
        
        return res
          .header('X-Response-Time', `${duration}ms`)
          .header('X-Cache', 'HIT')
          .json(cachedData);
      }

      const result = await this.fetchClientsUseCase.execute({
        language,
        userId: "user.sub",
        page,
        name,
        perPage,
      });

      if (result.isLeft()) {
        const error = result.value;
        if (error.constructor === ResourceNotFoundError)
          throw new NotFoundException();
        throw new BadRequestException();
      }

      const meta = result.value.meta;
      const response = {
        data: result.value.data.map(ClientDefaultPresenter.toHTTP),
        meta: {
          total: meta.total,
          last_page: meta.lastPage,
          current_page: meta.currentPage,
          per_page: meta.perPage,
          prev: meta.prev,
          next: meta.next,
        }
      };

      await this.cacheService.set(cacheKey, response, 300);

      const endTime = process.hrtime(startTime);
      const duration = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

      return res
        .header('X-Response-Time', `${duration}ms`)
        .header('X-Cache', 'MISS')
        .json(response);

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('An error occurred while fetching clients');
    }
  }
}