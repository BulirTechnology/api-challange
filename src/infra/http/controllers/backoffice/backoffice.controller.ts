import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  Body,
  Query,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResourceNotFoundError } from "@/core/errors";
import { GetUserByIdUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-user-details-by-id";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { AccountType } from "@prisma/client";
import { AccountTypeGuard } from "@/infra/auth/account-type.guard";
import { UpdateUserStateDto } from "./dtos/update-user-state.dto";
import { UpdateUserStateUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/update-user-state";
import { UsersManagementGetSummaryUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-users-management-summary";
import { GetUsersByAccountTypeUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/get-users-by-account-type";
import { ExportUsersUseCase } from "@/domain/users/application/use-cases/backoffice/users-management/export-users";
import { ExcelService } from "@/infra/xlsx/xlsx.service";
import { Response } from "express";

@ApiTags("Backoffice")
@UseGuards(JwtAuthGuard)
@Controller("/backoffice")
export class BackofficeController {
  constructor(
    private getUserByIdUseCase: GetUserByIdUseCase,
    private updateUserStateUseCase: UpdateUserStateUseCase,
    private usersManagementGetSummaryUseCase: UsersManagementGetSummaryUseCase,
    private getUsersByAccountTypeUseCase: GetUsersByAccountTypeUseCase,
    private exportUsersUseCase: ExportUsersUseCase,
    private excelService: ExcelService
  ) {}

  @Get("users/details/:id")
  @UseGuards(AccountTypeGuard(AccountType.SuperAdmin))
  async handle(@Param("id") id: string) {
    const data = await this.getUserByIdUseCase.execute({
      id,
    });

    if (data.isLeft()) {
      const error = data.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    return data;
  }

  @Patch("users/state/:userId")
  @UseGuards(AccountTypeGuard(AccountType.SuperAdmin))
  async updateUserState(
    @Param("userId") userId: string,
    @Body() updateUserStateDto: UpdateUserStateDto
  ) {
    const data = await this.updateUserStateUseCase.execute({
      id: userId,
      state: updateUserStateDto.state,
    });

    if (data.isLeft()) {
      const error = data.value;
      if (error.constructor === ResourceNotFoundError)
        throw new NotFoundException();
      throw new BadRequestException();
    }

    return data;
  }

  @Get("users/summary")
  @UseGuards(AccountTypeGuard(AccountType.SuperAdmin))
  async getUsersSummary(
    @Query("startOfCurrentWeek") startOfCurrentWeek: string,
    @Query("endOfCurrentWeek") endOfCurrentWeek: string
  ) {
    return this.usersManagementGetSummaryUseCase.execute({
      startOfCurrentWeek: new Date(startOfCurrentWeek),
      endOfCurrentWeek: new Date(endOfCurrentWeek),
    });
  }

  @Get("users")
  @UseGuards(AccountTypeGuard(AccountType.SuperAdmin))
  async getUsers(
    @Query("accountType") accountType: string,
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("name") name?: string,
    @Query("telephone") telephone?: string,
    @Query("id") id?: string,
    @Query("status") status?: string
  ) {
    return this.getUsersByAccountTypeUseCase.execute(
      accountType as "Client" | "ServiceProvider",
      page,
      limit,
      { name, telephone, id, status }
    );
  }

  @Get("users/export")
  @UseGuards(AccountTypeGuard(AccountType.SuperAdmin))
  async exportUsers(
    @Res() res: Response,
    @Query("accountType") accountType: string,
    @Query("name") name?: string,
    @Query("telephone") telephone?: string,
    @Query("id") id?: string,
    @Query("status") status?: string
  ) {
    const exportUsers = await this.exportUsersUseCase.execute(
      accountType as "Client" | "ServiceProvider",
      { name, telephone, id, status }
    );

    const date = new Date().toISOString().split("T")[0];
    const fileName = `${date}-users-export.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(exportUsers);
  }
}
