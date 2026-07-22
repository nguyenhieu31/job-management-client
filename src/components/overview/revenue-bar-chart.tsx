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
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchRevenueStats } from "@/store/slice/overview/Overview";
import { TimePeriod, RevenueDataPoint } from "@/types/overview";
import PeriodYearFilter from "./period-year-filter";
import { DollarSign } from "lucide-react";

const formatCurrency = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-bold text-emerald-600">
          ${(payload[0].value as number).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueBarChart() {
  const dispatch = useAppDispatch();
  const { revenueData, loading } = useAppSelector((s) => s.overview);

  const [period, setPeriod] = useState<TimePeriod>("CURRENT_MONTH");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchRevenueStats({ period, year }));
  }, [dispatch, period, year]);

  const chartData = (revenueData?.dataPoints ?? []).map((dp: RevenueDataPoint) => ({
    label: dp.label,
    revenue: Number(dp.revenue),
  }));

  const totalRevenue = revenueData?.totalRevenue ?? 0;
  const isEmpty = chartData.length === 0 || chartData.every((d: { label: string; revenue: number }) => d.revenue === 0);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Doanh Thu</h3>
            <p className="text-xs text-muted-foreground">
              Tổng doanh thu theo khoảng thời gian
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

      {/* Total Revenue summary */}
      <div className="mb-5">
        <span className="text-2xl font-bold text-emerald-600">
          ${Number(totalRevenue).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">Tổng cộng</span>
      </div>

      {/* Chart */}
      {loading && !revenueData ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <DollarSign className="h-10 w-10 opacity-30" />
          <p className="text-sm">Không có doanh thu trong khoảng thời gian này</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="25%">
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.4)" }} />
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
