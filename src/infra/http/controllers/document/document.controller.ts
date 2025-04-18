import { Public } from "@/infra/auth/public";
import {
  Controller,
  Get,
  Res,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import * as pdf from "html-pdf";
import { Response } from "express";
import { baseInvoice } from "./invoice-data";

@ApiTags("Documents")
@Controller("/documents")
@Public()
export class DocumentController {
  constructor() { }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      pdf.create(html, {}).toBuffer((err, buffer) => {
        if (err) {
          return reject(err);
        }
        resolve(buffer);
      });
    });
  }

  @Get(":transactionId")
  async invoice(
    @Res() res: Response
  ) {
    const pdfBuffer = await this.generatePdfFromHtml(baseInvoice);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=example.pdf",
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

}
