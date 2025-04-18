import { CreditPackage } from "@/domain/subscriptions/enterprise/credit-package";

export class CreditPackagePresenter {
  static toHTTP(creditPackage: CreditPackage) {
    return {
      id: creditPackage.id.toString(),
      amount: creditPackage.amount,
      name: creditPackage.name,
      status: creditPackage.status,
      total_credit: creditPackage.totalCredit,
      vat: creditPackage.vat,
      created_at: creditPackage.createdAt,
      updated_at: creditPackage.updatedAt
    };
  }
} 