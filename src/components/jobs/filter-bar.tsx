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
import {
  SearchJobByConditionsAction,
  SearchJobViewAction,
} from "@/store/slice/jobs/Jobs";
import { useAppDispatch, useAppSelector } from "@/store/store";
import type {
  JobFilters,
  JobStatus,
  PaymentStatus,
  Pagination as PaginationType,
  CustomerInfo,
  JobViewResponse,
  EmployeePaymentStatus,
} from "@/types/jobs";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import MultiSelectDropdown from "../ui/multi-select-dropdown";
import { EmployeeResponse } from "@/types/employees";
import { useDebounce } from "@/hooks/use-debounce";
import { getFirstDayOfMonth } from "@/lib/utils";

interface FilterBarProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  employees?: EmployeeResponse[];
  customers?: CustomerInfo[];
  onFiltersChange?: (filters: any) => void;
}

export function FilterBar({
  pagination,
  onPageChange,
  employees,
  customers,
  onFiltersChange,
}: FilterBarProps) {
  const dispatch = useAppDispatch();
  const { roleName } = useAppSelector((state) => state.authenticate);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<JobFilters>({
    fromDate: getFirstDayOfMonth(),
    toDate: "",
    jobStatus: "",
    paymentStatus: "",
    paymentEmployee: "",
    keyword: "",
  });
  const [selectedEmployees, setSelectedEmployees] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedCustomers, setSelectedCustomers] = useState<
    { id: number; name: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Redux store
  const {
    loadingSearching,
    jobView,
  }: { loadingSearching: boolean; jobView: JobViewResponse[] } = useAppSelector(
    (state) => state.job
  );

  const handleChange = (field: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      dispatch(SearchJobViewAction(debouncedSearchTerm.trim())).finally(() => {
        setShowSearchResults(true);
      });
    } else {
      setShowSearchResults(false);
    }
  }, [debouncedSearchTerm, dispatch]);

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
      paymentEmployee: !filters.paymentEmployee
        ? null
        : (filters.paymentEmployee as string),
      startDate: filters.fromDate || null,
      endDate: filters.toDate || null,
      selectedEmployeeIds: selectedEmployees ? selectedEmployees.map((e) => e.id) : undefined,
      selectedCustomerIds: selectedCustomers ? selectedCustomers.map((c) => c.id) : undefined,
    };
    onFiltersChange?.(payload);
    onPageChange(1);
    dispatch(SearchJobByConditionsAction(payload));
  };

  const handleResetFilters = () => {
    const resetFilters: JobFilters = {
      fromDate: getFirstDayOfMonth(),
      toDate: "",
      jobStatus: "",
      paymentStatus: "",
      paymentEmployee: "",
      keyword: "",
    };
    setFilters(resetFilters);
    setSelectedEmployees([]);
    setSelectedCustomers([]);
    setSearchTerm("");
    setShowSearchResults(false);
    onFiltersChange?.(null);
    // onPageChange(1);
  };

  return (
    <div className="rounded-lg border bg-card p-4 md:p-6">
      <div className="space-y-4">
        {/* Row 1: Date Range & Status Filters */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
              <SelectTrigger id="jobStatus" className="w-[200px] min-w-[100px]">
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

          {/* Payment Status - Manager Only */}
          {roleName === "MANAGER" && (
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
                <SelectTrigger id="paymentStatus" className="w-[200px] min-w-[100px]">
                  <SelectValue placeholder="Tất cả thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                  <SelectItem value="INVOICE_SENT">Đã gửi hóa đơn</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  <SelectItem value="NOT_PAYABLE">KHÔNG THANH TOÁN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(roleName === "SPECIAL" || roleName === "MANAGER")  && (
            <div className="space-y-2">
              <Label htmlFor="paymentEmployee" className="text-sm font-medium">
                Thanh Toán nhân viên
              </Label>
              <Select
                value={filters.paymentEmployee}
                onValueChange={(value) =>
                  handleChange("paymentEmployee", value as EmployeePaymentStatus | "all")
                }
              >
                <SelectTrigger id="paymentStatus" className="w-[200px] min-w-[100px]">
                  <SelectValue placeholder="Tất cả thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Row 2: Multi-Select Filters & Search - Manager Only */}
        {(roleName === "MANAGER" || roleName === "SALER") && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {/* Customer Multi-Select */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm font-medium">
                Khách hàng
              </Label>
              <MultiSelectDropdown
                options={
                  customers
                    ? customers.map((e) => ({ id: e.id, name: e.name }))
                    : []
                }
                placeholder="Chọn khách hàng..."
                onChange={(values) => setSelectedCustomers(values)}
                defaultValue={selectedCustomers}
                className="w-full"
                title="Khách hàng"
              />
            </div>

            {/* Employee Multi-Select */}
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-sm font-medium">
                Nhân viên
              </Label>
              <MultiSelectDropdown
                options={
                  employees
                    ? employees.map((e) => ({ id: e.id, name: e.fullName }))
                    : []
                }
                placeholder="Chọn nhân viên..."
                onChange={(values) => setSelectedEmployees(values)}
                defaultValue={selectedEmployees}
                className="w-full"
              />
            </div>

            {/* Search with Debounce */}
            <div className="space-y-2" ref={searchBoxRef}>
              <Label htmlFor="search" className="text-sm font-medium">
                Tìm Kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                {loadingSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
                )}
                <Input
                  id="search"
                  type="text"
                  placeholder="Tên job"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleChange("keyword", e.target.value);
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() && jobView.length) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="pl-9 w-full"
                  autoComplete="off"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchTerm.trim() && (
                  <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
                    {loadingSearching ? (
                      <div className="px-4 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Đang tìm kiếm...
                        </p>
                      </div>
                    ) : jobView && jobView.length > 0 ? (
                      <div className="overflow-y-auto max-h-72">
                        <div className="p-2 border-b border-border bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">
                            Tìm thấy {jobView.length} kết quả
                          </p>
                        </div>
                        {jobView.map((job: JobViewResponse) => (
                          <div
                            key={job.id}
                            className="px-3 py-2.5 hover:bg-accent cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                            onClick={() => {
                              setSearchTerm(job.caseName);
                              handleChange("keyword", job.caseName);
                              setShowSearchResults(false);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  #{job.code}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {job.caseName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          Không tìm thấy kết quả
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Thử tìm kiếm với từ khóa khác
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Row 2 Alternative: Search Only - Non-Manager */}
        {(roleName !== "MANAGER" && roleName !== "SALER") && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2" ref={searchBoxRef}>
              <Label htmlFor="search" className="text-sm font-medium">
                Tìm Kiếm
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                {loadingSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin z-10" />
                )}
                <Input
                  id="search"
                  type="text"
                  placeholder="Tên job"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleChange("keyword", e.target.value);
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() && jobView.length) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="pl-9 w-full"
                  autoComplete="off"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchTerm.trim() && (
                  <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-hidden">
                    {loadingSearching ? (
                      <div className="px-4 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Đang tìm kiếm...
                        </p>
                      </div>
                    ) : jobView && jobView.length > 0 ? (
                      <div className="overflow-y-auto max-h-72">
                        <div className="p-2 border-b border-border bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">
                            Tìm thấy {jobView.length} kết quả
                          </p>
                        </div>
                        {jobView.map((job: JobViewResponse) => (
                          <div
                            key={job.id}
                            className="px-3 py-2.5 hover:bg-accent cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                            onClick={() => {
                              setSearchTerm(job.caseName);
                              handleChange("keyword", job.caseName);
                              setShowSearchResults(false);
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  #{job.code}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {job.caseName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          Không tìm thấy kết quả
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Thử tìm kiếm với từ khóa khác
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <Button
            onClick={handleResetFilters}
            variant="outline"
            size="default"
            className="min-w-[100px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại
          </Button>
          <Button
            onClick={handleApplyFilters}
            size="default"
            className="min-w-[100px]"
          >
            <Search className="h-4 w-4 mr-2" />
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
}
