"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchJobByConditionsAction } from "@/store/slice/jobs/Jobs";
import { useAppDispatch, useAppSelector } from "@/store/store";
import type {
  JobFilters,
  JobStatus,
  PaymentStatus,
  Pagination as PaginationType,
} from "@/types/jobs";
import { Search, RotateCcw } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function FilterBar({ pagination, onPageChange }: FilterBarProps) {
  const dispatch = useAppDispatch();
  const {roleName} = useAppSelector(state=>state.authenticate);

  const [filters, setFilters] = useState<JobFilters>({
    fromDate: "",
    toDate: "",
    jobStatus: "",
    paymentStatus: "",
    keyword: "",
  });
  const handleChange = (field: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    const keyword = (
      (filters as any).keyword ??
      (filters as any).search ??
      ""
    ).trim();

    const payload = {
      pageNumber: 0,
      pageSize: pagination.pageSize,
      keyword,
      jobStatus: filters.jobStatus || null,
      paymentStatus: !filters.paymentStatus
        ? null
        : (filters.paymentStatus as string),
      startDate: filters.fromDate || null,
      endDate: filters.toDate || null,
    };
    onPageChange(1);
    dispatch(SearchJobByConditionsAction(payload));
  };

  const handleResetFilters = () => {
    const resetFilters: JobFilters = {
      fromDate: "",
      toDate: "",
      jobStatus: "",
      paymentStatus: "",
      keyword: "",
    };
    setFilters(resetFilters);
    // onPageChange(1);
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* From Date */}
        <div className="space-y-2">
          <Label htmlFor="fromDate" className="text-sm font-medium">
            Từ Ngày
          </Label>
          <Input
            id="fromDate"
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleChange("fromDate", e.target.value)}
            className="w-full"
          />
        </div>

        {/* To Date */}
        <div className="space-y-2">
          <Label htmlFor="toDate" className="text-sm font-medium">
            Đến Ngày
          </Label>
          <Input
            id="toDate"
            type="date"
            value={filters.toDate}
            onChange={(e) => handleChange("toDate", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Job Status */}
        <div className="space-y-2">
          <Label htmlFor="jobStatus" className="text-sm font-medium">
            Tình Trạng Công Việc
          </Label>
          <Select
            value={filters.jobStatus}
            onValueChange={(value) =>
              handleChange("jobStatus", value as JobStatus)
            }
          >
            <SelectTrigger id="jobStatus">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Chưa làm</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
              <SelectItem value="DONE">Đang đợi xét duyệt</SelectItem>
              <SelectItem value="IN_REVIEW">Nhận xét duyệt</SelectItem>
              <SelectItem value="REVIEWED">Hoàn thành xét duyệt</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Status */}
        <div className="space-y-2">
          <Label htmlFor="paymentStatus" className="text-sm font-medium">
            Tình Trạng Thanh Toán
          </Label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) =>
              handleChange("paymentStatus", value as PaymentStatus | "all")
            }
          >
            <SelectTrigger id="paymentStatus">
              <SelectValue placeholder="Tất cả thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
              <SelectItem value="INVOICE_SENT">Đã gửi hóa đơn</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Tìm Kiếm
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder={roleName !== 'MANAGER' ? "Tìm theo tên job, mã job..." : "Tên khách hàng, tên job, mã job..."}
              value={filters.keyword}
              onChange={(e) => handleChange("keyword", e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium invisible">Hành động</Label>
          <div className="flex gap-2">
            <Button
              onClick={handleApplyFilters}
              className="flex-1"
              size="default"
            >
              Áp dụng
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="default"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Đặt lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
