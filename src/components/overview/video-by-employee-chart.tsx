"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchVideoEmployeeStats } from "@/store/slice/overview/Overview";
import {
  TimePeriod,
  JobStatus,
  EmployeeOption,
  EmployeeStatItem,
} from "@/types/overview";
import PeriodYearFilter from "./period-year-filter";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
import { Film, ArrowLeft } from "lucide-react";

const STATUS_KEYS: JobStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "REJECTED",
  "IN_REVIEW",
  "REVIEWED",
  "COMPLETED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  DONE: "#10b981",
  REJECTED: "#ef4444",
  IN_REVIEW: "#8b5cf6",
  REVIEWED: "#06b6d4",
  COMPLETED: "#22c55e",
  TOTAL: "#6366f1",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  IN_PROGRESS: "Đang làm",
  DONE: "Hoàn thành",
  REJECTED: "Từ chối",
  IN_REVIEW: "Đang duyệt",
  REVIEWED: "Đã duyệt",
  COMPLETED: "Nghiệm thu",
  TOTAL: "Tổng",
};

const EmployeeAllTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const counts: Record<string, number> = data.counts || {};
    return (
      <div className="rounded-xl border bg-card/95 backdrop-blur px-4 py-3 shadow-lg min-w-[200px]">
        <p className="text-xs font-bold text-foreground mb-1">
          {data.name} {data.code ? `(${data.code})` : ""}
        </p>
        <p className="text-sm font-semibold text-violet-500 mb-2">
          Tổng: {data.total.toLocaleString("vi-VN")} video
        </p>
        <div className="space-y-1 text-[11px] border-t pt-1.5 border-border/60">
          {STATUS_KEYS.map((key) => {
            const cnt = counts[key] || 0;
            if (!cnt) return null;
            return (
              <div key={key} className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[key] }}
                  />
                  <span>{STATUS_LABELS[key]}:</span>
                </div>
                <span className="font-semibold text-foreground">{cnt.toLocaleString("vi-VN")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const EmployeeStatusTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-foreground">
          {payload[0].value.toLocaleString("vi-VN")} video
        </p>
      </div>
    );
  }
  return null;
};

export default function VideoByEmployeeChart() {
  const dispatch = useAppDispatch();
  const { videoEmployeeData, loading } = useAppSelector((s) => s.overview);

  const [period, setPeriod] = useState<TimePeriod>("DAY");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEmployees, setSelectedEmployees] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const employeeIds = selectedEmployees.map((e) => e.id);
    dispatch(
      fetchVideoEmployeeStats({
        period,
        year,
        employeeIds: employeeIds.length > 0 ? employeeIds : undefined,
      })
    );
  }, [dispatch, period, year, selectedEmployees]);

  const allEmployees: EmployeeOption[] = videoEmployeeData?.allEmployees ?? [];
  const employees: EmployeeStatItem[] = videoEmployeeData?.employees ?? [];

  // Options for MultiSelectDropdown
  const dropdownOptions = allEmployees.map((emp) => ({
    id: emp.id,
    name: emp.fullName ? `${emp.fullName} (${emp.code})` : emp.code,
  }));

  const isSingleView = selectedEmployees.length === 1;
  const isMultiFilter = selectedEmployees.length > 1;
  const selectedEmp = isSingleView
    ? allEmployees.find((e) => e.id === selectedEmployees[0].id)
    : null;

  // Chart data for All or Multi-selected view with stacked status breakdown
  const allChartData = employees.map((emp: EmployeeStatItem) => ({
    id: emp.employeeId,
    name: emp.employeeName || emp.employeeCode || `ID #${emp.employeeId}`,
    code: emp.employeeCode,
    total: emp.total,
    counts: emp.countsByStatus,
    PENDING: emp.countsByStatus?.PENDING || 0,
    IN_PROGRESS: emp.countsByStatus?.IN_PROGRESS || 0,
    DONE: emp.countsByStatus?.DONE || 0,
    REJECTED: emp.countsByStatus?.REJECTED || 0,
    IN_REVIEW: emp.countsByStatus?.IN_REVIEW || 0,
    REVIEWED: emp.countsByStatus?.REVIEWED || 0,
    COMPLETED: emp.countsByStatus?.COMPLETED || 0,
  }));

  // Chart data for single employee view: breakdown by status
  const singleStatusCounts = videoEmployeeData?.countsByStatus ?? {};
  const singleStatusEntries = Object.entries(singleStatusCounts).map(
    ([status, count]) => ({
      status: STATUS_LABELS[status] ?? status,
      count: count as number,
      color: STATUS_COLORS[status] ?? "#6b7280",
    })
  );
  const singleTotalCount = Object.values(singleStatusCounts).reduce(
    (acc: number, c) => acc + (Number(c) || 0),
    0
  );
  const singleChartData = [
    ...singleStatusEntries,
    {
      status: STATUS_LABELS.TOTAL,
      count: singleTotalCount,
      color: STATUS_COLORS.TOTAL,
    },
  ];

  const isEmpty = isSingleView
    ? singleChartData.every((d) => d.count === 0)
    : allChartData.length === 0 || allChartData.every((d) => d.total === 0);

  const totalAllVideos = isSingleView
    ? singleTotalCount
    : allChartData.reduce((acc, d) => acc + d.total, 0);

  const activeStaffCount = allChartData.filter((d) => d.total > 0).length;

  // Compute status totals across displayed data
  const statusTotals: Record<JobStatus, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    REJECTED: 0,
    IN_REVIEW: 0,
    REVIEWED: 0,
    COMPLETED: 0,
  };

  if (isSingleView) {
    for (const key of STATUS_KEYS) {
      statusTotals[key] = singleStatusCounts[key] || 0;
    }
  } else {
    for (const emp of allChartData) {
      for (const key of STATUS_KEYS) {
        statusTotals[key] += (emp as any)[key] || 0;
      }
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Film className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Tổng Số Video Theo Từng Nhân Viên
              </h3>
              {selectedEmployees.length > 0 && (
                <button
                  onClick={() => setSelectedEmployees([])}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 hover:bg-violet-500/20 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Xem tất cả
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSingleView
                ? `Chi tiết trạng thái video của ${selectedEmp?.fullName || selectedEmp?.code || selectedEmployees[0].name}`
                : isMultiFilter
                ? `So sánh trạng thái video của ${selectedEmployees.length} nhân viên đã chọn`
                : "Thống kê tất cả trạng thái video của từng nhân viên"}
            </p>
          </div>
        </div>

        {/* Filter Controls: MultiSelectDropdown + PeriodYearFilter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Employee MultiSelect Dropdown */}
          <div className="w-56 sm:w-64">
            <MultiSelectDropdown
              options={dropdownOptions}
              placeholder="Tất cả nhân viên"
              defaultValue={selectedEmployees}
              onChange={(values) => setSelectedEmployees(values)}
              className="w-full text-xs"
              title="Nhân viên"
            />
          </div>

          {/* Period + Year Filter */}
          <PeriodYearFilter
            period={period}
            year={year}
            onPeriodChange={setPeriod}
            onYearChange={setYear}
          />
        </div>
      </div>

      {/* Summary KPI Badges by Status */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg border bg-primary/10 border-primary/20 px-3 py-1 text-xs text-foreground">
          <span className="text-muted-foreground">Tổng:</span>
          <span className="font-bold text-primary">
            {totalAllVideos.toLocaleString("vi-VN")}
          </span>
        </div>
        {!isSingleView && (
          <div className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span>Nhân viên có việc:</span>
            <span className="font-bold text-foreground">
              {activeStaffCount} /{" "}
              {isMultiFilter ? selectedEmployees.length : allEmployees.length}
            </span>
          </div>
        )}
        {STATUS_KEYS.map((key) => {
          const count = statusTotals[key] || 0;
          if (count === 0) return null;
          return (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1 text-xs"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[key] }}
              />
              <span className="text-muted-foreground">{STATUS_LABELS[key]}:</span>
              <span className="font-semibold text-foreground">
                {count.toLocaleString("vi-VN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {loading && !videoEmployeeData ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Film className="h-10 w-10 opacity-30" />
          <p className="text-sm">Không có dữ liệu trong khoảng thời gian này</p>
        </div>
      ) : isSingleView ? (
        /* Single Employee Status Breakdown Bar Chart */
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={singleChartData} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<EmployeeStatusTooltip />}
              cursor={{ fill: "hsl(var(--muted)/0.4)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {singleChartData.map((entry, index) => (
                <Cell key={`vid-emp-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* All or Multi Employees Stacked Bar Chart with all statuses */
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={allChartData}
            barCategoryGap={allChartData.length > 10 ? "15%" : "25%"}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={allChartData.length > 6 ? -25 : 0}
              textAnchor={allChartData.length > 6 ? "end" : "middle"}
              height={allChartData.length > 6 ? 60 : 30}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<EmployeeAllTooltip />}
              cursor={{ fill: "hsl(var(--muted)/0.4)" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              formatter={(value) => (
                <span className="text-xs font-medium text-foreground">
                  {STATUS_LABELS[value] || value}
                </span>
              )}
            />
            {STATUS_KEYS.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                stackId="statusStack"
                fill={STATUS_COLORS[key]}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(entry: any) => {
                  if (entry && entry.id) {
                    setSelectedEmployees([
                      {
                        id: entry.id,
                        name: entry.name,
                      },
                    ]);
                  }
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
