import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { Buffer } from "buffer";

@Injectable()
export class ExcelService {
  async exportToExcel(
    columns: { header: string; key: string; width?: number }[],
    data: any[],
    fileName: string
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = columns;

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(excelBuffer);
  }
}
