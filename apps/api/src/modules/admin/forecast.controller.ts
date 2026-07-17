import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { IsEnum, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { AuthGuard, AuthenticatedRequest } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { ForecastService } from "./forecast.service";

enum ReportType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY"
}

class UploadReportDto {
  @IsString()
  @MinLength(1)
  reportName!: string;

  @IsEnum(ReportType)
  reportType!: "DAILY" | "WEEKLY" | "MONTHLY";

  @IsString()
  @MinLength(1)
  dataSource!: string;

  @IsString()
  @MinLength(1)
  fileContent!: string;

  @IsOptional()
  @IsIn(["csv", "xls", "xlsx"])
  fileFormat?: "csv" | "xls" | "xlsx";
}

@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin/forecast")
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Post("upload")
  async uploadReport(@Req() request: AuthenticatedRequest, @Body() body: UploadReportDto) {
    const adminName = request.user?.fullName || "Admin";
    return this.forecastService.uploadReport(
      adminName,
      body.reportName,
      body.reportType,
      body.dataSource,
      body.fileContent,
      body.fileFormat ?? "csv"
    );
  }

  @Delete("report/:id")
  async deleteReport(@Param("id") id: string) {
    return this.forecastService.deleteReport(id);
  }

  @Get("reports")
  async getReportsList() {
    return this.forecastService.getReportsList();
  }

  @Get("report/:id")
  async getReportsDetails(@Param("id") id: string) {
    return this.forecastService.getReportsDetails(id);
  }

  @Get("history")
  async getForecastHistory() {
    return this.forecastService.getForecastHistory();
  }

  @Get("status")
  async getForecastStatus() {
    return this.forecastService.getForecastStatus();
  }

  @Get("results")
  async getForecastResults() {
    return this.forecastService.getForecastResults();
  }

  @Post("run")
  async runForecast() {
    return this.forecastService.runForecast();
  }
}
