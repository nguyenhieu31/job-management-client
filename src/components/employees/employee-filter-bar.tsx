"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { EmployeeFilters } from "@/types/employees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EmployeeFilterBarProps {
  filters: EmployeeFilters;
  onFilterChange: (filters: EmployeeFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

const EmployeeStatusOptions = [
  { id: "ACTIVE", name: "Đang hoạt động" },
  { id: "INACTIVE", name: "Ngừng hoạt động" },
  { id: "ALL", name: "Tất cả" },
];

export function EmployeeFilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: EmployeeFilterBarProps) {
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
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              value={filters.search}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value })
              }
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statusEmployee" className="text-sm font-medium">
            Trạng thái nhân viên
          </Label>
          <Select
            value="ALL"
            onValueChange={(value) =>
              console.log("Selected employee status:", value)
            }
          >
            <SelectTrigger
              id="statusEmployee"
              className="w-[200px] min-w-[100px]"
            >
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {EmployeeStatusOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
