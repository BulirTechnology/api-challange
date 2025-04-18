import { PrismaService } from "./prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaHelpersRatingAndFavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async isFavorite(params: {
    clientId: string;
    serviceProviderId: string;
  }): Promise<boolean> {
    const total = await this.prisma.clientServiceProviderFavorite.count({
      where: {
        clientId: params.clientId,
        serviceProviderId: params.serviceProviderId,
      },
    });

    return total > 0;
  }
  async getRating(userId: string): Promise<number> {
    const reviewsAndRating = await this.prisma.reviewAndRating.aggregate({
      _count: {
        stars: true,
        reviewerId: true,
      },
      where: {
        reviewerId: userId,
      },
    });

    const stars = reviewsAndRating._count.stars;

    if (stars <= 0) return 0;

    return stars / reviewsAndRating._count.reviewerId;
  }

  async getUserRating(userId: string): Promise<number> {
    const reviewsAndRating = await this.prisma.reviewAndRating.aggregate({
      _avg: {
        stars: true,
      },
      where: {
        reviewerId: userId,
      },
    });

    const averageStars = reviewsAndRating._avg.stars;

    if (!averageStars) return 0;

    return averageStars;
  }
}
