"use client";

import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
}

export const getTodayDateInput = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
};

export default function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: DateRangeFilterProps) {
  const handleFromDateChange = (value: string) => {
    onFromDateChange(value);
    if (toDate && value > toDate) {
      onToDateChange(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-2">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span>Từ ngày</span>
        <Input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => handleFromDateChange(e.target.value)}
          className="h-8 w-[138px] bg-background px-2 text-xs"
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span>Đến ngày</span>
        <Input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => onToDateChange(e.target.value)}
          className="h-8 w-[138px] bg-background px-2 text-xs"
        />
      </label>
    </div>
  );
}
