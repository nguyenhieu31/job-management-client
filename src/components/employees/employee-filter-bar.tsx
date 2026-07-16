"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { EmployeeFilters, RoleDto } from "@/types/employees";
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
  roles: RoleDto[];
}

export function EmployeeFilterBar({
  filters,
  onFilterChange,
  onApply,
  onReset,
  roles,
}: EmployeeFilterBarProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 items-end">
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

        <div className="space-y-2">
          <Label htmlFor="roleFilter" className="text-sm font-medium">
            Vai Trò
          </Label>
          <Select
            value={filters.roleId || "ALL"}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                roleId: value === "ALL" ? undefined : value,
              })
            }
          >
            <SelectTrigger id="roleFilter" className="w-full min-w-[120px]">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả vai trò</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
