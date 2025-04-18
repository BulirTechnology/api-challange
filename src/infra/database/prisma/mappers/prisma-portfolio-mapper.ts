import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Portfolio } from "@/domain/users/enterprise/portfolio";
import { Portfolio as PrismaPortfolio } from "@prisma/client";

export class PrismaPortfolioMapper {
  static toDomain(info: PrismaPortfolio): Portfolio {
    return Portfolio.create({
      title: info.title,
      description: info.description,
      image1: info.image1,
      image2: info.image2,
      image3: info.image3,
      image4: info.image4,
      image5: info.image5,
      image6: info.image6,
      serviceProviderId: new UniqueEntityID(info.serviceProviderId),
    }, new UniqueEntityID(info.id));
  }

  static toPrisma(portfolio: Portfolio): PrismaPortfolio {
    return {
      id: portfolio.id.toString(),
      title: portfolio.title,
      description: portfolio.description,
      image1: portfolio.image1,
      image2: portfolio.image2,
      image3: portfolio.image3,
      image4: portfolio.image4,
      image5: portfolio.image5,
      image6: portfolio.image6,
      serviceProviderId: portfolio.serviceProviderId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}