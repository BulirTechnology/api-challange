import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Res,
  UseGuards,
} from "@nestjs/common";
import dayjs from "dayjs";
import path from "node:path";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import * as puppeteer from "puppeteer";
import * as ejs from "ejs";
import { readFileSync } from "node:fs";

import { Public } from "@/infra/auth/public";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";

import { formatPrice } from "@/helpers/price";

import { FetchUserTransactionDetailsUseCase } from "@/domain/payment/application/use-case/fetch-user-transaction-details";
import { FetchUserDetailsUseCase } from "@/domain/users/application/use-cases/user/account/fetch-user-details";
import { FetchWalletDetailsUseCase } from "@/domain/payment/application/use-case/fetch-wallet-details";
import { FetchActiveServiceProviderSubscriptionUseCase } from "@/domain/users/application/use-cases/service-provider/subscription/fetch-active-service-provider-subscription";
import { FetchSubscriptionPlanDetailsUseCase } from "@/domain/subscriptions/applications/use-cases/subscription-plan/fetch-subscription-plan-details";

const TRANSACTION_TYPE = {
  PurchaseCredit: "credit",
  DiscountCredit: "credit",
  ServiceFee: "received",
  Withdrawal: "received",
  Refund: "refund",
  Promotion: "received",
  AddMoney: "received",
  SubscriptionDebts: "subscription",
  SubscriptionPayment: "subscription",
  ServicePayment: "withdraw",
  ServiceSalary: "withdraw",
};

@ApiTags("Wallet")
@Controller("/wallet")
@Public()
export class DownloadInvoiceController {
  constructor(
    private fetchUserTransactionDetailsUseCase: FetchUserTransactionDetailsUseCase,
    private fetchUserDetails: FetchUserDetailsUseCase,
    private fetchWalletDetailsUseCase: FetchWalletDetailsUseCase,
    private fetchSubscriptionPlanDetails: FetchSubscriptionPlanDetailsUseCase,
    private fetchActiveServiceProviderSubscriptionUseCase: FetchActiveServiceProviderSubscriptionUseCase
  ) { }

  @Get("transactions/:transactionId/invoice-download")
  @UseGuards(JwtAuthGuard)
  async handle(
    @Res() res: Response,
    @Param("transactionId") transactionId: string,
    @Headers() headers: Record<string, string>
  ) {
    const response = await this.fetchUserTransactionDetailsUseCase.execute({
      transactionId,
      language: headers["accept-language"] == "en" ? "en" : "pt",
    });

    if (response.isLeft()) {
      throw new BadRequestException("Transaction not found");
    }

    const transaction = response.value.transaction;

    const responseWallet = await this.fetchWalletDetailsUseCase.execute({
      walletId: transaction.walletId.toString()
    });

    if (responseWallet.isLeft()) {
      throw new BadRequestException("wallet not found");
    }
    const wallet = responseWallet.value.wallet;

    const responseUser = await this.fetchUserDetails.execute({
      userId: wallet.userId.toString()
    });

    if (responseUser.isLeft()) {
      throw new BadRequestException("user not found");
    }

    const user = responseUser.value.user;
    let subscriptionPlanName = "", subscriptionDueDate = "";

    if (transaction.type === "SubscriptionPayment") {
      const subscriptionResponse = await this.fetchActiveServiceProviderSubscriptionUseCase.execute({
        userId: user.id
      });

      if (subscriptionResponse.isLeft()) {
        throw new BadRequestException("subscription not found");
      }

      const subscription = subscriptionResponse.value.data;

      const subscriptionPlan = await this.fetchSubscriptionPlanDetails.execute({
        planId: subscription.subscriptionPlanId.toString()
      });

      if (subscriptionPlan.isLeft()) {
        throw new BadRequestException("subscription not found");
      }

      subscriptionPlanName = subscriptionPlan.value.plan.name;
      subscriptionDueDate = dayjs(subscription?.endDate).format("DD/MM/YYYY");
    }

    const templatePath = path.join(
      __dirname,
      "../../../../../../support/pdf",
      `${TRANSACTION_TYPE[transaction.type]}.ejs`
    );
    const template = readFileSync(templatePath, "utf8");

    const html = ejs.render(template, {
      title: transaction.type,

      invoiceNum: transaction.createdAt.getTime(),
      billTo: user.name,
      billToAddress: user.address,
      invoiceDate: dayjs(transaction.createdAt).format("DD/MM/YYYY"),
      dueDate: subscriptionDueDate,

      plan: subscriptionPlanName,

      qty: "1",
      description: transaction.description,
      unityPrice: formatPrice(transaction.amount + ""),
      price: formatPrice(transaction.amount + ""),
      subtotal: formatPrice(transaction.amount + ""),
      iva: formatPrice("0"),
      total: formatPrice(transaction.amount + ""),
    });

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html);
    const pdfBuffer = await page.pdf();

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${transaction.createdAt.getTime()}.pdf`);
    res.send(pdfBuffer);
    return;
  }
}