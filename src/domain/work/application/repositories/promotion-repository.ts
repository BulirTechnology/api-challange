import { Pagination } from "@/core/repositories/pagination-params";
import { Promotion } from "../../enterprise/promotion";
import {
  PromotionFindById,
  PromotionFindByCode,
  PromotionPaginationParams
} from "../params/promotion-params";

export abstract class PromotionsRepository {
  abstract findMany(params: PromotionPaginationParams): Promise<Pagination<Promotion>>
  abstract findById(params: PromotionFindById): Promise<Promotion | null>
  abstract findByCode(code: PromotionFindByCode): Promise<Promotion | null>
  abstract create(promotion: Promotion): Promise<void>
}
 