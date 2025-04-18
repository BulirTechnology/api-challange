import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { PrismaReviewAndRatingMapper } from "../mappers/prisma-review-and-rating-mapper";

import { ReviewAndRatingRepository } from "@/domain/work/application/repositories/review-and-rating-repository";
import { ReviewAndRating } from "@/domain/work/enterprise/review-and-rating";
import { PaginationParams } from "@/core/repositories/pagination-params";

@Injectable()
export class PrismaReviewAndRatingRepository implements ReviewAndRatingRepository {
  constructor(private prisma: PrismaService) { }

  async findReviews(params: { userId: string; bookingId: string; reviewerId: string; }): Promise<ReviewAndRating | null> {
    const review = await this.prisma.reviewAndRating.findFirst({
      where: {
        bookingId: params.bookingId,
        reviewerId: params.reviewerId,
        userId: params.userId,
      }
    });

    return review ? PrismaReviewAndRatingMapper.toDomain(review) : null;
  }

  async findMany(params: PaginationParams): Promise<ReviewAndRating[]> {
    const page = params.page;

    const list = await this.prisma.reviewAndRating.findMany({
      take: 20,
      skip: (page - 1) * 20,
    });

    return list.map(PrismaReviewAndRatingMapper.toDomain);
  }

  async findById(id: string): Promise<ReviewAndRating | null> {
    const response = await this.prisma.reviewAndRating.findUnique({
      where: { id }
    });

    return response ? PrismaReviewAndRatingMapper.toDomain(response) : null;
  }

  async create(reason: ReviewAndRating): Promise<void> {
    const data = PrismaReviewAndRatingMapper.toPrisma(reason);

    const totalRegister = await this.prisma.reviewAndRating.count({
      where: {
        bookingId: data.bookingId,
        reviewerId: data.reviewerId,
        userId: data.userId,
      }
    });

    if (totalRegister <= 0) {
      await this.prisma.reviewAndRating.create({ data });
    } else {
      const bookingToUpdate = await this.prisma.reviewAndRating.findFirst({
        where: {
          bookingId: data.bookingId,
          reviewerId: data.reviewerId,
          userId: data.userId,
        }
      });
      await this.prisma.reviewAndRating.update({
        where: {
          id: bookingToUpdate?.id + ""
        },
        data: {
          stars: data.stars,
          comment: data.comment
        }
      });
    }

  }


}