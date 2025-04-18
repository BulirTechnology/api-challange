import { Injectable } from "@nestjs/common";
import { ExcelService } from "@/infra/xlsx/xlsx.service";
import { UserDTO } from "./dtos/users-management.dto";
import { GetUsersByAccountTypeUseCase } from "./get-users-by-account-type";

@Injectable()
export class ExportUsersUseCase {
  constructor(
    private getUsersByAccountTypeUseCase: GetUsersByAccountTypeUseCase,
    private excelService: ExcelService
  ) {}

  async execute(
    accountType: "Client" | "ServiceProvider" | "SuperAdmin",
    filters?: {
      name?: string;
      telephone?: string;
      id?: string;
      status?: string;
    }
  ): Promise<Buffer> {
    const allUsers: UserDTO[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const { data, totalUsers } =
        await this.getUsersByAccountTypeUseCase.execute(
          accountType,
          page,
          limit,
          filters
        );

      allUsers.push(...data);

      if (allUsers.length >= totalUsers) {
        break;
      }

      page++;
    }

    const columns = [
      { header: "ID", key: "id", width: 30 },
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Telephone", key: "telephone", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Address", key: "address", width: 50 },
    ];

    const data = allUsers.map((user) => ({
      ...user,
      address: user.address
        ? `${user.address.line1}, ${user.address.line2}, ${user.address.name}`
        : undefined,
    }));

    return this.excelService.exportToExcel(columns, data, "export-users.xlsx");
  }
}
