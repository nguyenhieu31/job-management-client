"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { WorkRequestFilters } from "@/types/work-requests";

interface WorkRequestFilterBarProps {
  filters: WorkRequestFilters;
  onFilterChange: (filters: WorkRequestFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function WorkRequestFilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: WorkRequestFilterBarProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-end">
        {/* Search */}
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm Kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm theo danh mục hoặc loại file..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 md:col-span-2 lg:col-span-1">
          <Button onClick={onApply} className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            Áp Dụng
          </Button>
          <Button onClick={onReset} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Đặt Lại
          </Button>
        </div>
      </div>
    </div>
  );
}
