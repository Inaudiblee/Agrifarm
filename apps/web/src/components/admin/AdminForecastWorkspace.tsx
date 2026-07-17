"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Circle,
  Download,
  FileSpreadsheet,
  Filter,
  History,
  Leaf,
  Loader2,
  Minus,
  Play,
  RefreshCw,
  Search,
  Sprout,
  Target,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { getApiBase, parseApiError } from "@/lib/api";

type ReportType = "DAILY" | "WEEKLY" | "MONTHLY";

type HistoricalReport = {
  id: string;
  reportName: string;
  reportType: ReportType;
  uploadDate: string;
  uploadedBy: string;
  dataSource: string;
  dateRange: string;
  recordsCount: number;
  productsIncluded: string;
};

type ForecastStep = {
  name: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
};

type ActiveRunStatus = {
  runId: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  error?: string;
  steps: ForecastStep[];
};

type MonthPoint = { month: string; value: number };

type ForecastResultRow = {
  id: string;
  product: string;
  historicalDemand: MonthPoint[] | string;
  forecastNextMonth: string | number;
  forecastNext3Months: MonthPoint[] | string;
  trend: "INCREASING" | "DECREASING" | "STABLE" | string;
  confidence: string | number;
  mape: string | number;
  mae: string | number;
  rmse: string | number;
  status: "GOOD" | "WARNING" | "NEEDS_RETRAINING" | string;
  modelUsed: string;
  trainingDatasetSize: number;
  testingDatasetSize: number;
};

type ForecastRecommendation = {
  id: string;
  product: string;
  recommendation: string;
};

type ForecastRunPayload = {
  id: string;
  forecastDate: string;
  datasetUsed: string;
  productsForecasted: number;
  sarimaModel: string;
  mape: string | number;
  duration: number;
  status: string;
  results: ForecastResultRow[];
  recommendations: ForecastRecommendation[];
};

type ForecastHistoryItem = {
  id: string;
  forecastDate: string;
  productsForecasted: number;
  sarimaModel: string;
  mape: string | number;
  duration: number;
  status: string;
};

type SortKey = "product" | "forecast" | "growth" | "confidence" | "mape" | "status";

const STEP_LABELS: Record<string, string> = {
  "Reading Historical Reports": "Historical Data Loaded",
  "Data Cleaning": "Cleaning Dataset",
  "Monthly Aggregation": "Monthly Aggregation",
  "Stationarity Test (ADF)": "ADF Stationarity Test",
  "Parameter Identification (ACF)": "ACF Analysis",
  "Parameter Identification (PACF)": "PACF Analysis",
  "Candidate Model Training": "Model Training",
  "Model Selection (AIC/BIC)": "AIC/BIC Selection",
  "Diagnostic Checking": "Diagnostic Checking",
  "Forecast Generation": "Forecast Generation",
  "Accuracy Validation": "Validation",
  "Saving Results": "Saving Results",
};

function num(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function pct(value: string | number) {
  return `${num(value).toFixed(1)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function parseJsonPoints(value: MonthPoint[] | string | null | undefined): MonthPoint[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((p) => ({ month: String(p.month), value: num(p.value) }));
  try {
    const parsed = JSON.parse(value) as MonthPoint[];
    return Array.isArray(parsed) ? parsed.map((p) => ({ month: String(p.month), value: num(p.value) })) : [];
  } catch {
    return [];
  }
}

function growthFromTrend(trend: string, forecast: number, history: MonthPoint[]) {
  const last = history.at(-1)?.value ?? 0;
  if (!last) return { label: "—", delta: 0 };
  const delta = ((forecast - last) / last) * 100;
  if (trend === "INCREASING") return { label: `↑ +${Math.abs(delta).toFixed(1)}%`, delta };
  if (trend === "DECREASING") return { label: `↓ -${Math.abs(delta).toFixed(1)}%`, delta };
  return { label: `${delta >= 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(1)}%`, delta };
}

function forecastSignalFromGrowth(delta: number) {
  if (delta > 10) return { tone: "good", label: "Increasing" };
  if (delta < -10) return { tone: "danger", label: "Declining" };
  return { tone: "warn", label: "Stable" };
}

function statusTone(status: string) {
  if (status === "GOOD" || status === "STABLE" || status === "INCREASING") return "good";
  if (status === "WARNING" || status === "MONITOR") return "warn";
  return "danger";
}

function recommendationTone(text: string, productTrend?: string) {
  const lower = text.toLowerCase();
  if (lower.includes("increase") || lower.includes("rise") || productTrend === "INCREASING") return "good";
  if (lower.includes("reduce") || lower.includes("decrease") || lower.includes("declin") || productTrend === "DECREASING") {
    return "danger";
  }
  return "warn";
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ForecastChart({
  history,
  forecast,
  product,
}: {
  history: MonthPoint[];
  forecast: MonthPoint[];
  product: string;
}) {
  const width = 920;
  const height = 420;
  const pad = { top: 28, right: 28, bottom: 44, left: 52 };
  const series = [
    ...history.map((p) => ({ ...p, kind: "history" as const })),
    ...forecast.map((p) => ({ ...p, kind: "forecast" as const })),
  ];

  if (series.length === 0) {
    return (
      <div className="af-chart-empty">
        <BarChart3 size={28} />
        <strong>No chart data yet</strong>
        <p>Upload historical reports and run a forecast to visualize demand.</p>
      </div>
    );
  }

  const values = series.map((p) => p.value);
  const max = Math.max(...values) * 1.18;
  const min = Math.min(0, Math.min(...values) * 0.9);
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const x = (i: number) => pad.left + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => pad.top + ((max - v) / (max - min || 1)) * innerH;

  const historyPts = series.filter((p) => p.kind === "history");
  const forecastPts = series.filter((p) => p.kind === "forecast");
  const join = historyPts.at(-1);

  const linePath = (pts: typeof series) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(series.indexOf(p)).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");

  const bandPath = (() => {
    if (forecastPts.length === 0 || !join) return "";
    const band = [join, ...forecastPts];
    const upper = band.map((p, i) => {
      const idx = series.indexOf(p);
      return `${i === 0 ? "M" : "L"} ${x(idx).toFixed(1)} ${y(p.value * 1.12).toFixed(1)}`;
    });
    const lower = [...band].reverse().map((p) => {
      const idx = series.indexOf(p);
      return `L ${x(idx).toFixed(1)} ${y(p.value * 0.88).toFixed(1)}`;
    });
    return `${upper.join(" ")} ${lower.join(" ")} Z`;
  })();

  const forecastLine = join ? [join, ...forecastPts] : forecastPts;

  return (
    <div className="af-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="af-chart-svg" role="img" aria-label={`Demand forecast chart for ${product}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const value = max - (max - min) * t;
          const yy = pad.top + innerH * t;
          return (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={yy} y2={yy} className="af-chart-grid" />
              <text x={pad.left - 10} y={yy + 4} textAnchor="end" className="af-chart-axis">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {bandPath ? <path d={bandPath} className="af-chart-band" /> : null}
        <path d={linePath(historyPts)} className="af-chart-history" fill="none" />
        <path d={linePath(forecastLine)} className="af-chart-forecast" fill="none" />

        {series.map((p, i) => (
          <g key={`${p.month}-${i}`}>
            <circle cx={x(i)} cy={y(p.value)} r={p.kind === "forecast" ? 4.5 : 3.5} className={p.kind === "forecast" ? "af-chart-dot-f" : "af-chart-dot-h"} />
            {(i === 0 || i === series.length - 1 || i % Math.ceil(series.length / 6) === 0) && (
              <text x={x(i)} y={height - 16} textAnchor="middle" className="af-chart-axis">
                {p.month.slice(2)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="af-chart-legend">
        <span>
          <i className="is-history" /> Historical Demand
        </span>
        <span>
          <i className="is-forecast" /> Forecast Demand
        </span>
        <span>
          <i className="is-band" /> Confidence Interval
        </span>
      </div>
    </div>
  );
}

export function AdminForecastWorkspace({
  token,
  onBusyChange,
}: {
  token: string | null;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<HistoricalReport[]>([]);
  const [results, setResults] = useState<ForecastRunPayload | null>(null);
  const [history, setHistory] = useState<ForecastHistoryItem[]>([]);
  const [runStatus, setRunStatus] = useState<ActiveRunStatus | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [forecastRange, setForecastRange] = useState<"1" | "3">("3");
  const [reportQuery, setReportQuery] = useState("");
  const [resultQuery, setResultQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("product");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [reportPage, setReportPage] = useState(1);
  const [resultPage, setResultPage] = useState(1);
  const cancelledRef = useRef(false);

  const api = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      const response = await fetch(`${getApiBase()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      if (response.status === 204) return null as T;
      const text = await response.text();
      if (!text.trim()) return null as T;
      return JSON.parse(text) as T;
    },
    [token]
  );

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [nextReports, nextResults, nextHistory, nextStatus] = await Promise.all([
        api<HistoricalReport[]>("/api/admin/forecast/reports"),
        api<ForecastRunPayload | null>("/api/admin/forecast/results"),
        api<ForecastHistoryItem[]>("/api/admin/forecast/history"),
        api<ActiveRunStatus | null>("/api/admin/forecast/status"),
      ]);
      setReports(nextReports ?? []);
      setResults(nextResults);
      setHistory(nextHistory ?? []);
      setRunStatus(nextStatus);
      const firstProduct = nextResults?.results?.[0]?.product;
      if (firstProduct) setSelectedProduct((current) => current || firstProduct);
    } catch (caught) {
      showToast({ type: "error", message: caught instanceof Error ? caught.message : "Unable to load forecast workspace." });
    } finally {
      setLoading(false);
    }
  }, [api, token, showToast]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!runStatus || runStatus.status !== "RUNNING") return;
    const timer = window.setInterval(async () => {
      if (cancelledRef.current) return;
      try {
        const status = await api<ActiveRunStatus | null>("/api/admin/forecast/status");
        setRunStatus(status);
        if (status?.status === "SUCCESS") {
          showToast({ type: "success", message: "Forecast completed successfully." });
          await loadAll();
        }
        if (status?.status === "FAILED") {
          showToast({ type: "error", message: status.error || "Forecast run failed." });
          await loadAll();
        }
      } catch {
        /* keep polling */
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [runStatus, api, loadAll, showToast]);

  useEffect(() => {
    onBusyChange?.(runStatus?.status === "RUNNING" || uploading);
  }, [runStatus, uploading, onBusyChange]);

  const productOptions = useMemo(() => results?.results.map((row) => row.product) ?? [], [results]);

  const activeResult = useMemo(() => {
    if (!results?.results?.length) return null;
    return results.results.find((row) => row.product === selectedProduct) ?? results.results[0];
  }, [results, selectedProduct]);

  const chartHistory = useMemo(() => {
    const points = parseJsonPoints(activeResult?.historicalDemand);
    if (selectedYear === "all") return points;
    return points.filter((p) => p.month.startsWith(selectedYear));
  }, [activeResult, selectedYear]);

  const chartForecast = useMemo(() => {
    const points = parseJsonPoints(activeResult?.forecastNext3Months);
    return forecastRange === "1" ? points.slice(0, 1) : points;
  }, [activeResult, forecastRange]);

  const yearOptions = useMemo(() => {
    const years = new Set(parseJsonPoints(activeResult?.historicalDemand).map((p) => p.month.slice(0, 4)));
    return ["all", ...Array.from(years).sort()];
  }, [activeResult]);

  const filteredReports = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    return reports.filter((report) => {
      if (!q) return true;
      return `${report.reportName} ${report.reportType} ${report.dateRange} ${report.dataSource}`.toLowerCase().includes(q);
    });
  }, [reports, reportQuery]);

  const reportSlice = useMemo(() => {
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
    const page = Math.min(reportPage, totalPages);
    const start = (page - 1) * pageSize;
    return { items: filteredReports.slice(start, start + pageSize), page, totalPages, total: filteredReports.length };
  }, [filteredReports, reportPage]);

  const rankedResults = useMemo(() => {
    const rows = [...(results?.results ?? [])];
    const q = resultQuery.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (statusFilter !== "all") {
        const hist = parseJsonPoints(row.historicalDemand);
        const growth = growthFromTrend(row.trend, num(row.forecastNextMonth), hist);
        const tone = forecastSignalFromGrowth(growth.delta).tone;
        if (statusFilter === "good" && tone !== "good") return false;
        if (statusFilter === "warn" && tone !== "warn") return false;
        if (statusFilter === "danger" && tone !== "danger") return false;
      }
      if (!q) return true;
      return `${row.product} ${row.status} ${row.trend}`.toLowerCase().includes(q);
    });

    filtered.sort((a, b) => {
      const histA = parseJsonPoints(a.historicalDemand);
      const histB = parseJsonPoints(b.historicalDemand);
      const growthA = growthFromTrend(a.trend, num(a.forecastNextMonth), histA).delta;
      const growthB = growthFromTrend(b.trend, num(b.forecastNextMonth), histB).delta;
      const map: Record<SortKey, number | string> = {
        product: a.product,
        forecast: num(a.forecastNextMonth),
        growth: growthA,
        confidence: num(a.confidence),
        mape: num(a.mape),
        status: a.status,
      };
      const mapB: Record<SortKey, number | string> = {
        product: b.product,
        forecast: num(b.forecastNextMonth),
        growth: growthB,
        confidence: num(b.confidence),
        mape: num(b.mape),
        status: b.status,
      };
      const left = map[sortKey];
      const right = mapB[sortKey];
      if (typeof left === "string" && typeof right === "string") {
        return sortDir === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      }
      return sortDir === "asc" ? Number(left) - Number(right) : Number(right) - Number(left);
    });

    return filtered;
  }, [results, resultQuery, statusFilter, sortKey, sortDir]);

  const resultSlice = useMemo(() => {
    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(rankedResults.length / pageSize));
    const page = Math.min(resultPage, totalPages);
    const start = (page - 1) * pageSize;
    return { items: rankedResults.slice(start, start + pageSize), page, totalPages, total: rankedResults.length };
  }, [rankedResults, resultPage]);

  const summary = useMemo(() => {
    const accuracy = results ? 100 - num(results.mape) : null;
    const prev = history.find((item) => item.id !== results?.id && item.status === "SUCCESS");
    const prevAccuracy = prev ? 100 - num(prev.mape) : null;
    const accuracyDelta = accuracy != null && prevAccuracy != null ? accuracy - prevAccuracy : null;
    return {
      products: results?.productsForecasted ?? 0,
      accuracy,
      accuracyDelta,
      lastForecast: results?.forecastDate ? formatShortDate(results.forecastDate) : "—",
      nextRun: "On demand",
    };
  }, [results, history]);

  const modelPerformance = useMemo(() => {
    if (!activeResult) {
      return { mae: "—", rmse: "—", mape: "—", model: "—", duration: "—", train: "—", test: "—" };
    }
    return {
      mae: num(activeResult.mae).toFixed(2),
      rmse: num(activeResult.rmse).toFixed(2),
      mape: pct(activeResult.mape),
      model: activeResult.modelUsed || results?.sarimaModel || "SARIMA",
      duration: results ? `${(results.duration / 1000).toFixed(1)}s` : "—",
      train: String(activeResult.trainingDatasetSize),
      test: String(activeResult.testingDatasetSize),
    };
  }, [activeResult, results]);

  async function uploadReportFile(file: File) {
    const lowerName = file.name.toLowerCase();
    const isCsv = lowerName.endsWith(".csv");
    const isXls = lowerName.endsWith(".xls");
    const isXlsx = lowerName.endsWith(".xlsx");
    const isExcel = isXls || isXlsx;
    if (!isCsv && !isExcel) {
      showToast({ type: "warning", message: "Please upload a .csv, .xls, or .xlsx file." });
      return;
    }

    setUploading(true);
    try {
      const fileFormat = isExcel ? (isXls ? "xls" : "xlsx") : "csv";
      const fileContent = isExcel ? arrayBufferToBase64(await file.arrayBuffer()) : await file.text();
      const reportName = file.name.replace(/\.(csv|xls|xlsx)$/i, "");
      await api("/api/admin/forecast/upload", {
        method: "POST",
        body: JSON.stringify({
          reportName,
          reportType: "MONTHLY",
          dataSource: isExcel ? "Admin Excel upload" : "Admin CSV upload",
          fileContent,
          fileFormat,
        }),
      });
      showToast({ type: "success", message: "Historical report uploaded." });
      await loadAll();
    } catch (caught) {
      showToast({ type: "error", message: caught instanceof Error ? caught.message : "Upload failed." });
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadReportFile(file);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadReportFile(file);
    event.target.value = "";
  }

  async function deleteReport(id: string) {
    try {
      await api(`/api/admin/forecast/report/${id}`, { method: "DELETE" });
      showToast({ type: "success", message: "Report deleted." });
      await loadAll();
    } catch (caught) {
      showToast({ type: "error", message: caught instanceof Error ? caught.message : "Delete failed." });
    }
  }

  async function runForecast() {
    cancelledRef.current = false;
    try {
      const status = await api<ActiveRunStatus>("/api/admin/forecast/run", { method: "POST" });
      setRunStatus(status);
      showToast({ type: "info", message: "SARIMA forecast started." });
    } catch (caught) {
      showToast({ type: "error", message: caught instanceof Error ? caught.message : "Unable to start forecast." });
    }
  }

  function cancelForecast() {
    if (runStatus?.status !== "RUNNING") return;
    cancelledRef.current = true;
    showToast({ type: "warning", message: "Stopped watching this run. The server job may still finish." });
    setRunStatus((current) => (current ? { ...current, status: "FAILED", error: "Cancelled by administrator" } : current));
  }

  function exportResults() {
    if (!results?.results?.length) {
      showToast({ type: "warning", message: "No forecast results to export." });
      return;
    }
    downloadCsv("agrifarm-forecast-results.csv", [
      ["Product", "Forecast Next Month", "Trend", "Confidence", "MAPE", "MAE", "RMSE", "Status", "Model"],
      ...results.results.map((row) => [
        row.product,
        String(row.forecastNextMonth),
        row.trend,
        String(row.confidence),
        String(row.mape),
        String(row.mae),
        String(row.rmse),
        row.status,
        row.modelUsed,
      ]),
    ]);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const running = runStatus?.status === "RUNNING";
  const steps = runStatus?.steps ?? [];

  const recommendationGroups = useMemo(() => {
    const rows = results?.results ?? [];
    const recs = results?.recommendations ?? [];
    const byProduct = new Map(recs.map((rec) => [rec.product, rec]));

    const rising = rows
      .filter((row) => row.trend === "INCREASING" || recommendationTone(byProduct.get(row.product)?.recommendation ?? "", row.trend) === "good")
      .map((row) => ({
        product: row.product,
        text: byProduct.get(row.product)?.recommendation ?? `Demand for ${row.product} is expected to rise. Prioritize harvest and inventory.`,
      }));

    const falling = rows
      .filter((row) => row.trend === "DECREASING" || recommendationTone(byProduct.get(row.product)?.recommendation ?? "", row.trend) === "danger")
      .map((row) => ({
        product: row.product,
        text: byProduct.get(row.product)?.recommendation ?? `Demand for ${row.product} is expected to soften. Reduce surplus planting pressure.`,
      }));

    const seasonal = rows
      .filter((row) => row.trend === "STABLE" || recommendationTone(byProduct.get(row.product)?.recommendation ?? "", row.trend) === "warn")
      .map((row) => ({
        product: row.product,
        text: byProduct.get(row.product)?.recommendation ?? `${row.product} looks seasonally stable. Keep steady harvest cadence.`,
      }));

    // Fallback: use raw recommendations if trend grouping is empty
    if (!rising.length && !falling.length && !seasonal.length && recs.length) {
      for (const rec of recs) {
        const tone = recommendationTone(rec.recommendation);
        const item = { product: rec.product, text: rec.recommendation };
        if (tone === "good") rising.push(item);
        else if (tone === "danger") falling.push(item);
        else seasonal.push(item);
      }
    }

    return { rising, falling, seasonal };
  }, [results]);

  if (loading) {
    return (
      <div className="af-workspace af-skeleton af-flow">
        <div className="af-skel-header" />
        <div className="af-skel-metrics">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="af-skel-body af-skel-stack">
          <div />
          <div />
          <div />
        </div>
      </div>
    );
  }

  const progressSteps = steps.length
    ? steps
    : Object.keys(STEP_LABELS).map((name) => ({ name, status: "PENDING" as const }));

  return (
    <div className="af-workspace af-flow">
      <header className="af-header">
        <div>
          <h1>
            <TrendingUp size={22} /> Demand Forecast
          </h1>
          <p>Forecast agricultural demand using the SARIMA forecasting model.</p>
        </div>
      </header>

      {/* Overview */}
      <section className="af-section" aria-labelledby="af-overview-title">
        <div className="af-section-label">
          <h2 id="af-overview-title">Overview</h2>
          <p>Summary cards for the latest SARIMA run</p>
        </div>
        <div className="af-metrics">
          <article className="af-metric">
            <span className="af-metric-icon">
              <Leaf size={16} />
            </span>
            <strong>{summary.products}</strong>
            <p>Products Forecasted</p>
            <small className="af-trend is-flat">
              <Minus size={12} /> Latest successful run
            </small>
          </article>
          <article className="af-metric">
            <span className="af-metric-icon">
              <Target size={16} />
            </span>
            <strong>{summary.accuracy == null ? "—" : `${summary.accuracy.toFixed(1)}%`}</strong>
            <p>Forecast Accuracy</p>
            <small className={`af-trend ${summary.accuracyDelta == null ? "is-flat" : summary.accuracyDelta >= 0 ? "is-up" : "is-down"}`}>
              {summary.accuracyDelta == null ? (
                <>
                  <Minus size={12} /> No prior comparison
                </>
              ) : summary.accuracyDelta >= 0 ? (
                <>
                  <ArrowUpRight size={12} /> ↑ +{summary.accuracyDelta.toFixed(1)}% vs previous
                </>
              ) : (
                <>
                  <ArrowDownRight size={12} /> ↓ {summary.accuracyDelta.toFixed(1)}% vs previous
                </>
              )}
            </small>
          </article>
          <article className="af-metric">
            <span className="af-metric-icon">
              <Activity size={16} />
            </span>
            <strong>{summary.lastForecast}</strong>
            <p>Last Forecast</p>
            <small className="af-trend is-flat">
              <CheckCircle2 size={12} /> {results?.status === "SUCCESS" ? "Completed" : "Awaiting first run"}
            </small>
          </article>
          <article className="af-metric">
            <span className="af-metric-icon">
              <CalendarClock size={16} />
            </span>
            <strong>{summary.nextRun}</strong>
            <p>Next Scheduled Run</p>
            <small className="af-trend is-flat">
              <Minus size={12} /> Manual trigger
            </small>
          </article>
        </div>
      </section>

      {/* Historical Reports */}
      <section className="af-section af-card" aria-labelledby="af-reports-title">
        <div className="af-card-head">
          <div>
            <h2 id="af-reports-title">Historical Reports</h2>
            <p>Upload report · Report list</p>
          </div>
          <div className="af-card-tools">
            <label className="af-search">
              <Search size={14} />
              <input
                value={reportQuery}
                onChange={(e) => {
                  setReportQuery(e.target.value);
                  setReportPage(1);
                }}
                placeholder="Search reports"
              />
            </label>
            <button type="button" className="af-btn secondary compact" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={14} /> Upload Report
            </button>
          </div>
        </div>

        <div
          className={`af-dropzone${dragOver ? " is-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <FileSpreadsheet size={18} />
          <div>
            <strong>{uploading ? "Uploading…" : "Upload Report"}</strong>
            <p>
              CSV or Excel (.xls, .xlsx) · Supports Date/Product/Quantity, or AgriFarm monthly harvest sheets (Vegetable Crops /
              Harvest kg)
            </p>
          </div>
        </div>

        <div className="af-table-wrap" style={{ marginTop: 14 }}>
          <table className="af-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Date Range</th>
                <th>Upload Date</th>
                <th>Records</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportSlice.items.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.reportName}</strong>
                    <small>{report.dataSource}</small>
                  </td>
                  <td>{report.reportType}</td>
                  <td>{report.dateRange}</td>
                  <td>{formatShortDate(report.uploadDate)}</td>
                  <td>{report.recordsCount.toLocaleString()}</td>
                  <td>
                    <em className="af-pill good">Ready</em>
                  </td>
                  <td>
                    <button type="button" className="af-link danger" onClick={() => void deleteReport(report.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {reportSlice.total === 0 ? (
                <tr>
                  <td colSpan={7} className="af-empty-cell">
                    No historical reports yet. Upload a CSV/Excel with Date, Product, Quantity — or an AgriFarm monthly
                    harvest sheet (January–June style).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="af-table-foot">
          <small>
            Page {reportSlice.page} of {reportSlice.totalPages} · {reportSlice.total} total
          </small>
          <div className="af-pager">
            <button type="button" className="af-btn outline compact" disabled={reportSlice.page <= 1} onClick={() => setReportPage((p) => p - 1)}>
              Prev
            </button>
            <button
              type="button"
              className="af-btn outline compact"
              disabled={reportSlice.page >= reportSlice.totalPages}
              onClick={() => setReportPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Forecast Controls */}
      <section className="af-section af-card" aria-labelledby="af-controls-title">
        <div className="af-card-head compact">
          <div>
            <h2 id="af-controls-title">Forecast Controls</h2>
            <p>Run Forecast · Retrain · Export</p>
          </div>
        </div>
        <div className="af-controls af-controls-row">
          <button type="button" className="af-btn primary" onClick={() => void runForecast()} disabled={running || reports.length === 0}>
            {running ? <Loader2 className="af-spin" size={15} /> : <Play size={15} />}
            Run Forecast
          </button>
          <button type="button" className="af-btn secondary" onClick={() => void runForecast()} disabled={running || reports.length === 0}>
            <RefreshCw size={15} /> Retrain
          </button>
          <button type="button" className="af-btn secondary" onClick={exportResults}>
            <Download size={15} /> Export
          </button>
          <button type="button" className="af-btn danger" onClick={cancelForecast} disabled={!running}>
            <XCircle size={15} /> Cancel
          </button>
        </div>
      </section>

      {/* Forecast Progress */}
      <section className="af-section af-card" aria-labelledby="af-progress-title">
        <div className="af-card-head compact">
          <div>
            <h2 id="af-progress-title">Forecast Progress</h2>
            <p>Live stepper for the SARIMA pipeline</p>
          </div>
          <em className={`af-pill ${running ? "warn" : runStatus?.status === "FAILED" ? "danger" : runStatus?.status === "SUCCESS" ? "good" : "warn"}`}>
            {running ? "Running" : runStatus?.status === "FAILED" ? "Failed" : runStatus?.status === "SUCCESS" ? "Complete" : "Idle"}
          </em>
        </div>
        <ol className="af-stepper">
          {progressSteps.map((step, index) => {
            const label = STEP_LABELS[step.name] ?? step.name;
            return (
              <li key={step.name} className={`is-${step.status.toLowerCase()}`}>
                <span className="af-stepper-index">{index + 1}</span>
                <span className="af-stepper-icon">
                  {step.status === "SUCCESS" ? (
                    <CheckCircle2 size={15} />
                  ) : step.status === "RUNNING" ? (
                    <Loader2 className="af-spin" size={15} />
                  ) : step.status === "FAILED" ? (
                    <XCircle size={15} />
                  ) : (
                    <Circle size={15} />
                  )}
                </span>
                <span className="af-stepper-label">{label}</span>
              </li>
            );
          })}
        </ol>
        {runStatus?.error ? (
          <p className="af-error">
            <AlertTriangle size={14} /> {runStatus.error}
          </p>
        ) : null}
      </section>

      {/* Forecast Results */}
      <section className="af-section af-card" aria-labelledby="af-results-title">
        <div className="af-card-head">
          <div>
            <h2 id="af-results-title">Forecast Results</h2>
            <p>Historical vs Forecast chart · Forecast table</p>
          </div>
          <div className="af-card-tools af-chart-toolbar">
            <label>
              Product
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                {productOptions.length === 0 ? <option value="">No products</option> : null}
                {productOptions.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year === "all" ? "All years" : year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Forecast Range
              <select value={forecastRange} onChange={(e) => setForecastRange(e.target.value as "1" | "3")}>
                <option value="1">Next month</option>
                <option value="3">Next 3 months</option>
              </select>
            </label>
            <button type="button" className="af-btn outline compact" onClick={() => void loadAll()}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="af-results-block">
          <h3>Historical vs Forecast Chart</h3>
          <ForecastChart history={chartHistory} forecast={chartForecast} product={selectedProduct || "Demand"} />
        </div>

        <div className="af-results-block">
          <div className="af-card-head compact" style={{ marginTop: 8 }}>
            <h3>Forecast Table</h3>
            <div className="af-card-tools">
              <label className="af-search">
                <Search size={14} />
                <input
                  value={resultQuery}
                  onChange={(e) => {
                    setResultQuery(e.target.value);
                    setResultPage(1);
                  }}
                  placeholder="Search products"
                />
              </label>
              <label className="af-filter">
                <Filter size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setResultPage(1);
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="good">Stable / Good</option>
                  <option value="warn">Monitor</option>
                  <option value="danger">Declining</option>
                </select>
              </label>
              <button type="button" className="af-btn outline compact" onClick={exportResults}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="af-table-wrap">
            <table className="af-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => toggleSort("product")}>
                      Product
                    </button>
                  </th>
                  <th>Historical Demand</th>
                  <th>
                    <button type="button" onClick={() => toggleSort("forecast")}>
                      Forecast
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort("growth")}>
                      Growth
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort("confidence")}>
                      Confidence
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort("mape")}>
                      MAPE
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => toggleSort("status")}>
                      Status
                    </button>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {resultSlice.items.map((row) => {
                  const hist = parseJsonPoints(row.historicalDemand);
                  const lastHist = hist.at(-1)?.value ?? 0;
                  const growth = growthFromTrend(row.trend, num(row.forecastNextMonth), hist);
                  const signal = forecastSignalFromGrowth(growth.delta);
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.product}</strong>
                      </td>
                      <td>{lastHist.toLocaleString()}</td>
                      <td>{num(row.forecastNextMonth).toLocaleString()}</td>
                      <td className={`af-growth is-${signal.tone}`}>{growth.label}</td>
                      <td>{pct(row.confidence)}</td>
                      <td>{pct(row.mape)}</td>
                      <td>
                        <em className={`af-pill ${signal.tone}`}>{signal.label}</em>
                      </td>
                      <td>
                        <button type="button" className="af-link" onClick={() => setSelectedProduct(row.product)}>
                          View chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {resultSlice.total === 0 ? (
                  <tr>
                    <td colSpan={8} className="af-empty-cell">
                      No forecast results yet. Run a forecast after uploading historical data.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="af-table-foot">
            <small>
              Page {resultSlice.page} of {resultSlice.totalPages} · {resultSlice.total} total
            </small>
            <div className="af-pager">
              <button type="button" className="af-btn outline compact" disabled={resultSlice.page <= 1} onClick={() => setResultPage((p) => p - 1)}>
                Prev
              </button>
              <button
                type="button"
                className="af-btn outline compact"
                disabled={resultSlice.page >= resultSlice.totalPages}
                onClick={() => setResultPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Model Performance */}
      <section className="af-section af-card" aria-labelledby="af-model-title">
        <div className="af-card-head compact">
          <div>
            <h2 id="af-model-title">Model Performance</h2>
            <p>MAE · RMSE · MAPE · Selected SARIMA model</p>
          </div>
        </div>
        <div className="af-perf-grid af-perf-grid-4">
          <div>
            <small>MAE</small>
            <strong>{modelPerformance.mae}</strong>
          </div>
          <div>
            <small>RMSE</small>
            <strong>{modelPerformance.rmse}</strong>
          </div>
          <div>
            <small>MAPE</small>
            <strong>{modelPerformance.mape}</strong>
          </div>
          <div>
            <small>Selected SARIMA Model</small>
            <strong title={modelPerformance.model}>{modelPerformance.model}</strong>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="af-section af-card" aria-labelledby="af-recs-title">
        <div className="af-card-head compact">
          <div>
            <h2 id="af-recs-title">Recommendations</h2>
            <p>Best crops · Lower harvest · Seasonal insights</p>
          </div>
        </div>
        <div className="af-rec-columns">
          <div className="af-rec-col">
            <h3>
              <ArrowUpRight size={15} /> Best crops expected to have high harvest
            </h3>
            <div className="af-recs">
              {recommendationGroups.rising.map((item) => (
                <article key={`up-${item.product}`} className="af-rec is-good">
                  <strong>{item.product}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
              {recommendationGroups.rising.length === 0 ? (
                <div className="af-empty-inline">
                  <p>No high-harvest recommendations yet.</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="af-rec-col">
            <h3>
              <ArrowDownRight size={15} /> Crops expected to have lower harvest
            </h3>
            <div className="af-recs">
              {recommendationGroups.falling.map((item) => (
                <article key={`down-${item.product}`} className="af-rec is-danger">
                  <strong>{item.product}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
              {recommendationGroups.falling.length === 0 ? (
                <div className="af-empty-inline">
                  <p>No lower-harvest recommendations yet.</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="af-rec-col">
            <h3>
              <Sprout size={15} /> Seasonal insights
            </h3>
            <div className="af-recs">
              {recommendationGroups.seasonal.map((item) => (
                <article key={`season-${item.product}`} className="af-rec is-warn">
                  <strong>{item.product}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
              {recommendationGroups.seasonal.length === 0 ? (
                <div className="af-empty-inline">
                  <p>No seasonal insights yet.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Forecast History */}
      <section className="af-section af-card" aria-labelledby="af-history-title">
        <div className="af-card-head compact">
          <div>
            <h2 id="af-history-title">
              <History size={18} /> Forecast History
            </h2>
            <p>Previous forecast runs</p>
          </div>
        </div>
        <div className="af-table-wrap">
          <table className="af-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Products</th>
                <th>Model</th>
                <th>MAPE</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.forecastDate)}</td>
                  <td>{item.productsForecasted}</td>
                  <td>{item.sarimaModel}</td>
                  <td>{pct(item.mape)}</td>
                  <td>{(item.duration / 1000).toFixed(1)}s</td>
                  <td>
                    <em className={`af-pill ${item.status === "SUCCESS" ? "good" : item.status === "FAILED" ? "danger" : "warn"}`}>
                      {item.status}
                    </em>
                  </td>
                </tr>
              ))}
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="af-empty-cell">
                    No previous forecast runs yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        hidden
        onChange={onFileChange}
      />
    </div>
  );
}
