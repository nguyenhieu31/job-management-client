"use client";

import { TimePeriod } from "@/types/overview";

interface PeriodYearFilterProps {
  period: TimePeriod;
  year: number;
  onPeriodChange: (period: TimePeriod) => void;
  onYearChange: (year: number) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "DAY", label: "Hôm nay" },
  { value: "7_DAYS", label: "7 ngày" },
  { value: "CURRENT_MONTH", label: "Tháng này" },
  { value: "PREVIOUS_MONTH", label: "Tháng trước" },
  { value: "3_MONTHS", label: "3 tháng" },
  { value: "YEAR", label: "Năm" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function PeriodYearFilter({
  period,
  year,
  onPeriodChange,
  onYearChange,
}: PeriodYearFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            id={`period-filter-${p.value}`}
            onClick={() => onPeriodChange(p.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
              ${
                period === p.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Year selector */}
      <select
        id="overview-year-select"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
