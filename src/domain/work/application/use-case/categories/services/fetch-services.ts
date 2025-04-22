import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/either";
import { MetaPagination } from "@/core/repositories/pagination-params";

import { Service } from "../../../../enterprise";
import { ServicesRepository } from "../../../repositories";
import { LanguageSlug } from "@/domain/users/enterprise";
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface FetchServicesUseCaseRequest {
  page: number
  perPage?: number
  subSubcategoryId: string
  language: LanguageSlug
}

type FetchServicesUseCaseResponse = Either<
  null,
  {
    services: Service[]
    meta: MetaPagination
  }
>

@Injectable()
export class FetchServicesUseCase {
  constructor(private servicesRepository: ServicesRepository,     
    @Inject(CACHE_MANAGER) private cacheManager: Cache,) { }

    async execute({
      page,
      subSubcategoryId,
      language,
      perPage
    }: FetchServicesUseCaseRequest): Promise<FetchServicesUseCaseResponse> {
      const cacheKey = `services:${language}:${subSubcategoryId || 'all'}:${page}:${perPage}`;
    
      try {
        const cachedResult = await this.cacheManager.get<{ services: any[]; meta: MetaPagination }>(cacheKey);
        if (cachedResult) {
          // Convert cached raw data back to domain objects
          const services = cachedResult.services.map(service => 
            Service.create({
              title: language === "en" ? service.titleEn : service.title,
              titleEn: service.titleEn,
              parentId: new UniqueEntityID(service.subSubCategoryId),
              createdAt: new Date(service.createdAt),
              updatedAt: service.updatedAt ? new Date(service.updatedAt) : null
            }, new UniqueEntityID(service.id))
          );
          return right({
            services,
            meta: cachedResult.meta
          });
        }
      } catch (error) {
        console.error('Cache get error:', error);
      }
    
      const result = await this.servicesRepository.findMany({
        language,
        subSubcategoryId,
        page,
        perPage,
        select: { id: true, title: true, parentId: true }
      });
    
      const response: FetchServicesUseCaseResponse = right({
        services: result.data,
        meta: result.meta,
      });
    
      try {
        // Store the raw Prisma data in cache with compression
        const rawServices = result.data.map(service => ({
          id: service.id.toString(),
          title: service.title,
          titleEn: service.titleEn,
          subSubCategoryId: service.parentId.toString(),
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }));
        
        // Use a longer TTL for better cache hit ratio
        await this.cacheManager.set(cacheKey, {
          services: rawServices,
          meta: result.meta
        }, 3600); // 1 hour TTL
      } catch (error) {
        console.error('Cache set error:', error);
      }
    
      return response;
    }
}
