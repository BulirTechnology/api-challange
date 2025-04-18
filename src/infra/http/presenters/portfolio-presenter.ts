import { Portfolio } from "@/domain/users/enterprise/portfolio";

export class PortfolioPresenter {
  static toHTTP(portfolio: Portfolio, storageUrl: string) {
    return {
      id: portfolio.id.toString(),
      title: portfolio.title,
      description: portfolio.description,
      image1: portfolio.image1 && portfolio.image1 != "null" ? storageUrl + portfolio.image1 : null,
      image2: portfolio.image2 && portfolio.image2 != "null" ? storageUrl + portfolio.image2 : null,
      image3: portfolio.image3 && portfolio.image3 != "null" ? storageUrl + portfolio.image3 : null,
      image4: portfolio.image4 && portfolio.image4 != "null" ? storageUrl + portfolio.image4 : null,
      image5: portfolio.image5 && portfolio.image5 != "null" ? storageUrl + portfolio.image5 : null,
      image6: portfolio.image6 && portfolio.image6 != "null" ? storageUrl + portfolio.image6 : null,
      service_provider_id: portfolio.serviceProviderId.toString(),
      created_at: portfolio.createdAt,
      updated_at: portfolio.updatedAt
    };
  }
} 