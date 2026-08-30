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
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchJobStatusStats } from "@/store/slice/overview/Overview";
import { TimePeriod, JobStatus } from "@/types/overview";
import PeriodYearFilter from "./period-year-filter";
import { Briefcase } from "lucide-react";

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-foreground">
          {payload[0].value.toLocaleString("vi-VN")} công việc
        </p>
      </div>
    );
  }
  return null;
};

export default function JobStatusChart() {
  const dispatch = useAppDispatch();
  const { jobStatusData, loading } = useAppSelector((s) => s.overview);

  const [period, setPeriod] = useState<TimePeriod>("CURRENT_MONTH");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchJobStatusStats({ period, year }));
  }, [dispatch, period, year]);

  const counts = jobStatusData?.countsByStatus ?? {};
  const statusEntries = Object.entries(counts).map(([status, count]) => ({
    status: STATUS_LABELS[status] ?? status,
    count: count as number,
    color: STATUS_COLORS[status] ?? "#6b7280",
  }));

  const totalCount = Object.values(counts).reduce(
    (acc: number, count) => acc + (Number(count) || 0),
    0
  );

  const chartData = [
    ...statusEntries,
    {
      status: STATUS_LABELS.TOTAL,
      count: totalCount,
      color: STATUS_COLORS.TOTAL,
    },
  ];

  const isEmpty = chartData.every((d) => d.count === 0);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Briefcase className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Công Việc theo Trạng Thái
            </h3>
            <p className="text-xs text-muted-foreground">
              Tổng số công việc photo theo từng trạng thái
            </p>
          </div>
        </div>
        <PeriodYearFilter
          period={period}
          year={year}
          onPeriodChange={setPeriod}
          onYearChange={setYear}
        />
      </div>

      {/* Chart */}
      {loading && !jobStatusData ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Briefcase className="h-10 w-10 opacity-30" />
          <p className="text-sm">Không có dữ liệu trong khoảng thời gian này</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="30%">
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`job-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
