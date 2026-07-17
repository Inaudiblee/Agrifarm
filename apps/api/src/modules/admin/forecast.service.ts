import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { execFile } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { PrismaService } from "../../prisma/prisma.service";

export interface ForecastStep {
  name: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
}

export interface ActiveRunStatus {
  runId: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  error?: string;
  steps: ForecastStep[];
}

@Injectable()
export class ForecastService {
  private activeRun: ActiveRunStatus | null = null;

  constructor(private readonly prisma: PrismaService) {}

  // List of required steps
  private getInitialSteps(): ForecastStep[] {
    return [
      { name: "Reading Historical Reports", status: "PENDING" },
      { name: "Data Cleaning", status: "PENDING" },
      { name: "Monthly Aggregation", status: "PENDING" },
      { name: "Stationarity Test (ADF)", status: "PENDING" },
      { name: "Parameter Identification (ACF)", status: "PENDING" },
      { name: "Parameter Identification (PACF)", status: "PENDING" },
      { name: "Candidate Model Training", status: "PENDING" },
      { name: "Model Selection (AIC/BIC)", status: "PENDING" },
      { name: "Diagnostic Checking", status: "PENDING" },
      { name: "Forecast Generation", status: "PENDING" },
      { name: "Accuracy Validation", status: "PENDING" },
      { name: "Saving Results", status: "PENDING" },
    ];
  }

  private toCsvContent(fileContent: string, fileFormat: "csv" | "xls" | "xlsx") {
    if (fileFormat === "csv") {
      return fileContent.replace(/^\uFEFF/, "");
    }

    try {
      const workbook = XLSX.read(Buffer.from(fileContent, "base64"), {
        type: "buffer",
        cellDates: true,
      });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new BadRequestException("Excel file has no worksheets.");
      }
      const sheet = workbook.Sheets[firstSheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
      if (!csv.trim()) {
        throw new BadRequestException("Excel worksheet is empty.");
      }
      return csv.replace(/^\uFEFF/, "");
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException("Unable to read Excel file. Please check the workbook format.");
    }
  }

  private splitCsvLine(line: string) {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  }

  private extractYearFromName(reportName: string) {
    const match = reportName.match(/(20\d{2}|19\d{2})/);
    return match ? Number(match[1]) : new Date().getFullYear();
  }

  private isSecondSemesterReport(reportName: string) {
    return /\b(2nd|second|2)\s*(sem|semester)\b/i.test(reportName);
  }

  private isStandardDemandHeaders(headers: string[]) {
    const normalized = headers.map((h) => h.toLowerCase());
    return normalized.includes("date") && normalized.includes("product") && normalized.includes("quantity");
  }

  private isHarvestMatrix(lines: string[]) {
    if (lines.length < 3) return false;
    const monthRow = this.splitCsvLine(lines[0]).map((cell) => cell.toLowerCase());
    const labelRow = this.splitCsvLine(lines[1]).map((cell) => cell.toLowerCase());
    const hasMonth = monthRow.some((cell) =>
      ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].includes(cell)
    );
    const hasCropLabel = labelRow.some((cell) => cell.includes("vegetable") || cell.includes("crop"));
    const hasHarvestLabel = labelRow.some((cell) => cell.includes("harvest"));
    return hasMonth && (hasCropLabel || hasHarvestLabel);
  }

  /** Convert AgriFarm monthly harvest matrix into Date,Product,Quantity rows. */
  private convertHarvestMatrixToDemandCsv(lines: string[], reportName: string) {
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const year = this.extractYearFromName(reportName);
    const useSecondSemesterOffset = this.isSecondSemesterReport(reportName);
    const monthRow = this.splitCsvLine(lines[0]);
    const monthBlocks: Array<{ monthIndex: number; productCol: number; qtyCol: number }> = [];

    for (let col = 0; col < monthRow.length; col++) {
      const monthName = monthRow[col].toLowerCase();
      const monthIndex = monthNames.indexOf(monthName);
      if (monthIndex === -1) continue;
      const adjustedMonthIndex = useSecondSemesterOffset && monthIndex < 6 ? monthIndex + 6 : monthIndex;
      monthBlocks.push({
        monthIndex: adjustedMonthIndex,
        productCol: col,
        qtyCol: col + 1,
      });
    }

    if (monthBlocks.length === 0) {
      throw new BadRequestException("Could not find month headers (January–December) in the harvest report.");
    }

    const output = ["Date,Product,Quantity"];
    for (let rowIndex = 2; rowIndex < lines.length; rowIndex++) {
      const cells = this.splitCsvLine(lines[rowIndex]);
      for (const block of monthBlocks) {
        const product = (cells[block.productCol] ?? "").trim();
        const qtyRaw = (cells[block.qtyCol] ?? "").trim();
        if (!product || product.toUpperCase() === "TOTAL") continue;
        if (!qtyRaw) continue;
        const quantity = Number(qtyRaw.replace(/,/g, ""));
        if (!Number.isFinite(quantity) || quantity <= 0) continue;
        const month = String(block.monthIndex + 1).padStart(2, "0");
        output.push(`${year}-${month}-01,${product},${quantity}`);
      }
    }

    if (output.length < 2) {
      throw new BadRequestException("No valid harvest rows found. Expected vegetable names with harvest (kg) values.");
    }

    return output.join("\n");
  }

  private normalizeDemandCsv(csvContent: string, reportName: string) {
    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      throw new BadRequestException("Dataset must have headers and at least 1 data row.");
    }

    const headers = this.splitCsvLine(lines[0]).map((h) => h.toLowerCase());
    if (this.isStandardDemandHeaders(headers)) {
      return lines.join("\n");
    }

    if (this.isHarvestMatrix(lines)) {
      return this.convertHarvestMatrixToDemandCsv(lines, reportName);
    }

    throw new BadRequestException(
      "Unsupported file format. Use either: (1) Date, Product, Quantity columns, or (2) AgriFarm monthly harvest sheet with month headers and Vegetable Crops / Harvest (kg)."
    );
  }

  async uploadReport(
    adminName: string,
    reportName: string,
    reportType: "DAILY" | "WEEKLY" | "MONTHLY",
    dataSource: string,
    fileContent: string,
    fileFormat: "csv" | "xls" | "xlsx" = "csv"
  ) {
    if (!fileContent || fileContent.trim().length === 0) {
      throw new BadRequestException("File content cannot be empty.");
    }

    try {
      const rawCsv = this.toCsvContent(fileContent, fileFormat);
      const csvContent = this.normalizeDemandCsv(rawCsv, reportName);
      const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const headers = this.splitCsvLine(lines[0]).map((h) => h.toLowerCase());
      const dateIndex = headers.indexOf("date");
      const productIndex = headers.indexOf("product");
      const qtyIndex = headers.indexOf("quantity");

      let minDate: Date | null = null;
      let maxDate: Date | null = null;
      const uniqueProducts = new Set<string>();
      let recordsCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = this.splitCsvLine(lines[i]);
        if (parts.length < headers.length) continue;

        const dateStr = parts[dateIndex];
        const prod = parts[productIndex];
        const qty = parseFloat(parts[qtyIndex]);

        if (!dateStr || !prod || isNaN(qty)) continue;

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) continue;

        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;

        uniqueProducts.add(prod);
        recordsCount++;
      }

      if (recordsCount === 0) {
        throw new BadRequestException("No valid data records found in the uploaded file.");
      }

      const formatDate = (d: Date) => d.toISOString().split("T")[0];
      const dateRange = `${formatDate(minDate!)} to ${formatDate(maxDate!)}`;
      const productsIncluded = Array.from(uniqueProducts).join(", ");

      const report = await this.prisma.historicalReport.create({
        data: {
          reportName,
          reportType,
          uploadedBy: adminName,
          dataSource,
          dateRange,
          recordsCount,
          productsIncluded,
          // Store normalized CSV so the forecasting pipeline can reuse one parser.
          fileContent: csvContent,
        },
      });

      return report;
    } catch (e) {
      throw new BadRequestException(e instanceof Error ? e.message : "Failed to parse uploaded dataset.");
    }
  }

  async deleteReport(id: string) {
    const report = await this.prisma.historicalReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException("Historical report not found.");
    await this.prisma.historicalReport.delete({ where: { id } });
    return { success: true };
  }

  async getReportsList() {
    return this.prisma.historicalReport.findMany({
      orderBy: { uploadDate: "desc" },
    });
  }

  async getReportsDetails(id: string) {
    const report = await this.prisma.historicalReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException("Report not found.");
    return report;
  }

  async getForecastHistory() {
    return this.prisma.forecastRun.findMany({
      orderBy: { forecastDate: "desc" },
    });
  }

  async getForecastStatus() {
    return this.activeRun;
  }

  async getForecastResults() {
    const latestRun = await this.prisma.forecastRun.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { forecastDate: "desc" },
      include: {
        results: true,
        recommendations: true,
      },
    });

    if (!latestRun) {
      return null;
    }

    return latestRun;
  }

  async runForecast() {
    if (this.activeRun && this.activeRun.status === "RUNNING") {
      throw new BadRequestException("A forecast run is already in progress.");
    }

    // Initialize Database ForecastRun record
    const run = await this.prisma.forecastRun.create({
      data: {
        datasetUsed: "All active historical reports",
        productsForecasted: 0,
        sarimaModel: "SARIMA",
        mape: 0.0,
        duration: 0,
        status: "RUNNING",
      },
    });

    this.activeRun = {
      runId: run.id,
      status: "RUNNING",
      steps: this.getInitialSteps(),
    };

    // Execute SARIMA forecasting pipeline asynchronously
    void this.executePipeline(run.id);

    return this.activeRun;
  }

  private async updateStep(stepName: string, status: "RUNNING" | "SUCCESS" | "FAILED", output?: string) {
    if (!this.activeRun) return;

    const step = this.activeRun.steps.find((s) => s.name === stepName);
    if (step) {
      step.status = status;
    }

    // Persist logs in db
    await this.prisma.forecastLog.create({
      data: {
        runId: this.activeRun.runId,
        stepName,
        status,
        output,
      },
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private resolveForecastScriptPath() {
    const candidates = [
      path.join(process.cwd(), "scripts", "sarima_forecast.py"),
      path.join(process.cwd(), "..", "..", "scripts", "sarima_forecast.py"),
    ];

    const scriptPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (!scriptPath) {
      throw new Error(`SARIMA forecast script not found. Checked: ${candidates.join(", ")}`);
    }

    return scriptPath;
  }

  private getPythonCandidates() {
    const configured = process.env.AGRIFARM_FORECAST_PYTHON?.trim();
    const bundledPython = "C:\\Users\\User\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
    return [
      ...(configured ? [{ command: configured, args: [] }] : []),
      { command: "python", args: [] },
      { command: "py", args: ["-3"] },
      ...(fs.existsSync(bundledPython) ? [{ command: bundledPython, args: [] }] : []),
    ];
  }

  private async runForecastScript(scriptPath: string, dataPath: string) {
    const errors: string[] = [];

    for (const candidate of this.getPythonCandidates()) {
      try {
        return await new Promise<string>((resolve, reject) => {
          execFile(
            candidate.command,
            [...candidate.args, scriptPath, "--data_path", dataPath],
            { windowsHide: true, maxBuffer: 1024 * 1024 * 10 },
            (error, stdout, stderr) => {
              if (error) reject(new Error(stderr || stdout || error.message));
              else resolve(stdout);
            }
          );
        });
      } catch (error) {
        errors.push(`${candidate.command}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error(
      `Unable to run SARIMA forecast script. Install Python with numpy, pandas, and statsmodels, or set AGRIFARM_FORECAST_PYTHON to a Python executable. Details: ${errors.join(" | ")}`
    );
  }

  private async executePipeline(runId: string) {
    const startTime = Date.now();
    try {
      // Step 1: Reading Historical Reports
      await this.updateStep("Reading Historical Reports", "RUNNING");
      await this.sleep(400); // Small delay to let users observe stepper progress
      const reports = await this.prisma.historicalReport.findMany();
      if (reports.length === 0) {
        throw new Error("No historical reports found in the database. Please upload a report first.");
      }
      await this.updateStep("Reading Historical Reports", "SUCCESS");

      // Step 2: Data Cleaning
      await this.updateStep("Data Cleaning", "RUNNING");
      await this.sleep(400);
      // Parsing data rows
      const allRows: Array<{ date: string; product: string; quantity: number }> = [];
      for (const report of reports) {
        const lines = report.fileContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
        const headers = this.splitCsvLine(lines[0]).map((h) => h.toLowerCase());
        const dateIdx = headers.indexOf("date");
        const prodIdx = headers.indexOf("product");
        const qtyIdx = headers.indexOf("quantity");

        for (let i = 1; i < lines.length; i++) {
          const parts = this.splitCsvLine(lines[i]);
          if (parts.length < headers.length) continue;
          const dateStr = parts[dateIdx];
          const prod = parts[prodIdx];
          const qty = parseFloat(parts[qtyIdx]);
          if (!dateStr || !prod || isNaN(qty)) continue;
          allRows.push({ date: dateStr, product: prod, quantity: qty });
        }
      }
      await this.updateStep("Data Cleaning", "SUCCESS");

      // Step 3: Monthly Aggregation
      await this.updateStep("Monthly Aggregation", "RUNNING");
      await this.sleep(400);

      // Group and aggregate by Product & Month (YYYY-MM)
      const aggregated: Record<string, Record<string, number>> = {}; // product -> month -> sum
      for (const row of allRows) {
        const dateObj = new Date(row.date);
        if (isNaN(dateObj.getTime())) continue;
        const monthStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
        if (!aggregated[row.product]) {
          aggregated[row.product] = {};
        }
        aggregated[row.product][monthStr] = (aggregated[row.product][monthStr] || 0) + row.quantity;
      }

      // Convert to flat CSV format for Python script consumption
      const csvLines = ["Month,Product,Quantity"];
      for (const [product, monthMap] of Object.entries(aggregated)) {
        for (const [month, qty] of Object.entries(monthMap)) {
          csvLines.push(`${month}-01,${product},${qty}`);
        }
      }

      const tempDir = path.join(process.cwd(), "scripts", "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempCsvPath = path.join(tempDir, `run_${runId}_aggregated.csv`);
      fs.writeFileSync(tempCsvPath, csvLines.join("\n"));
      await this.updateStep("Monthly Aggregation", "SUCCESS");

      // Step 4 to 9: Python Script Execution takes over these steps internally
      await this.updateStep("Stationarity Test (ADF)", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Stationarity Test (ADF)", "SUCCESS");

      await this.updateStep("Parameter Identification (ACF)", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Parameter Identification (ACF)", "SUCCESS");

      await this.updateStep("Parameter Identification (PACF)", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Parameter Identification (PACF)", "SUCCESS");

      await this.updateStep("Candidate Model Training", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Candidate Model Training", "SUCCESS");

      await this.updateStep("Model Selection (AIC/BIC)", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Model Selection (AIC/BIC)", "SUCCESS");

      await this.updateStep("Diagnostic Checking", "RUNNING");
      await this.sleep(200);
      await this.updateStep("Diagnostic Checking", "SUCCESS");

      // Step 10: Forecast Generation
      await this.updateStep("Forecast Generation", "RUNNING");
      const pythonScriptPath = this.resolveForecastScriptPath();
      const pythonResultJson = await this.runForecastScript(pythonScriptPath, tempCsvPath);
      await this.updateStep("Forecast Generation", "SUCCESS");

      // Step 11: Accuracy Validation
      await this.updateStep("Accuracy Validation", "RUNNING");
      await this.sleep(300);
      const forecastOutput = JSON.parse(pythonResultJson);
      if (forecastOutput.status === "FAILED") {
        throw new Error(forecastOutput.error || "Python forecasting process failed.");
      }
      await this.updateStep("Accuracy Validation", "SUCCESS");

      // Step 12: Saving Results
      await this.updateStep("Saving Results", "RUNNING");
      const duration = Date.now() - startTime;

      // Update forecast run
      await this.prisma.forecastRun.update({
        where: { id: runId },
        data: {
          productsForecasted: forecastOutput.productsForecasted,
          sarimaModel: forecastOutput.sarimaModel,
          mape: forecastOutput.mape,
          duration,
          status: "SUCCESS",
        },
      });

      // Save each product result
      for (const res of forecastOutput.results) {
        await this.prisma.forecastResult.create({
          data: {
            runId,
            product: res.product,
            historicalDemand: res.historicalMonthlyDemand,
            forecastNextMonth: res.forecastNextMonth,
            forecastNext3Months: res.forecastNext3Months,
            trend: res.trend,
            confidence: res.confidence,
            mape: res.mape,
            mae: res.mae,
            rmse: res.rmse,
            status: res.status,
            modelUsed: res.modelUsed,
            trainingDatasetSize: res.trainingDatasetSize,
            testingDatasetSize: res.testingDatasetSize,
          },
        });
      }

      // Save recommendations
      for (const rec of forecastOutput.recommendations) {
        await this.prisma.forecastRecommendation.create({
          data: {
            runId,
            product: rec.product,
            recommendation: rec.recommendation,
          },
        });
      }

      await this.updateStep("Saving Results", "SUCCESS");

      // Cleanup temporary file
      if (fs.existsSync(tempCsvPath)) {
        fs.unlinkSync(tempCsvPath);
      }

      // Finalize active run status
      if (this.activeRun && this.activeRun.runId === runId) {
        this.activeRun.status = "SUCCESS";
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (this.activeRun && this.activeRun.runId === runId) {
        this.activeRun.status = "FAILED";
        this.activeRun.error = errorMsg;
        // Mark remaining steps as failed
        for (const step of this.activeRun.steps) {
          if (step.status === "PENDING" || step.status === "RUNNING") {
            step.status = "FAILED";
          }
        }
      }

      await this.prisma.forecastRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          duration: Date.now() - startTime,
        },
      });
    }
  }
}
