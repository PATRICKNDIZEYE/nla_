import path from "path";
import fs from "fs-extra";
import hbs from "handlebars";
import puppeteer from "puppeteer";
import moment from "moment";
import { Disputes } from "@/models/Dispute";

hbs.registerHelper("FormatDate", function (value: any, format: any) {
  return new hbs.SafeString(moment(value).format(format));
});

hbs.registerHelper("eq", (left: any, right: any) => left === right);

export default class ReportService {
  private static async compile(template: string, data: any) {
    const filePath = path.join(
      process.cwd(),
      "src/templates",
      `${template}.hbs`
    );
    const html = await fs.readFile(filePath, "utf-8");
    return hbs.compile(html)(data);
  }

  private static async generatePDF(html: string) {
    const browser = await puppeteer.launch({
      headless: "new",
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({
      format: "A4",
      margin: {
        top: "20px",
        bottom: "40px",
        left: "0px",
        right: "40px",
      },
      scale: 0.7,
    });
    await browser.close();
    return pdf;
  }

  static async getReport(
    startDate: string,
    endDate: string,
    data: Array<Disputes>,
    dataLength: number,
    creatorname: string
  ) {
    try {
      const html = await this.compile(
        "disputes-report",
        Object.assign(
          {},
          {
            disputes: JSON.parse(JSON.stringify(data)),
            startDate,
            endDate,
            dataLength,
            today: Date.now(),
            creatorname,
          }
        )
      );
      const pdf = await this.generatePDF(html);
      return {
        pdf,
        startDate,
        endDate,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
