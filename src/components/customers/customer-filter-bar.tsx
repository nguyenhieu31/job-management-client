"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { CustomerFilters } from "@/types/customers";
import type { EmployeeResponse } from "@/types/employees";
import SearchableDropdown from "@/components/ui/search-able-dropdown";
import { useAppSelector } from "@/store/store";

interface CustomerFilterBarProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
  onApply: () => void;
  onReset: () => void;
  sales: EmployeeResponse[];
}

export function CustomerFilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
  sales,
}: CustomerFilterBarProps) {
  const { roleName } = useAppSelector((state) => state.authenticate);
  const saleOptions = sales.map((s) => ({
    id: s.id,
    name: s.fullName + (s.code ? ` (${s.code})` : ""),
  }));

  const selectedSale = saleOptions.find((o) => o.id === filters.saleId) || null;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Tìm Kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Tìm theo tên, email..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>

        {roleName !== "SALER" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Sale Phụ Trách</label>
            <SearchableDropdown
              key={filters.saleId ?? "all-sales"}
              options={saleOptions}
              defaultValue={selectedSale}
              onChange={(option) =>
                onFilterChange({ ...filters, saleId: option ? option.id : undefined })
              }
              placeholder="Tất cả sale"
              type="text"
            />
          </div>
        )}

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
