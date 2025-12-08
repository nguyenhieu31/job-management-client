"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SearchJobByConditionsAction,
  SearchJobViewAction,
} from "@/store/slice/jobs/Jobs";
import { useAppDispatch, useAppSelector } from "@/store/store";
import type {
  CustomerInfo,
  JobFilters,
  JobViewResponse,
  Pagination as PaginationType,
} from "@/types/jobs";
import { EmployeeResponse } from "@/types/employees";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
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
  employees = [],
  customers,
  onFiltersChange,
}: FilterBarProps) {
  const dispatch = useAppDispatch();
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<JobFilters>({
    fromDate: getFirstDayOfMonth(),
    toDate: "",
    jobStatus: "",
    paymentStatus: "",
    paymentEmployee: "",
    keyword: "",
    selectedEmployeeIds: [],
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

    const selectedEmployeeIds = selectedEmployees.map((e) => e.id);

    const payload = {
      pageNumber: 0,
      pageSize: pagination.pageSize,
      keyword,
      jobStatus: filters.jobStatus || null,
      paymentStatus: !filters.paymentStatus
        ? null
        : (filters.paymentStatus as string),
      paymentEmployee: null,
      startDate: filters.fromDate || null,
      endDate: filters.toDate || null,
      selectedEmployeeIds: selectedEmployeeIds.length
        ? selectedEmployeeIds
        : undefined,
      selectedCustomerIds: selectedCustomers
        ? selectedCustomers.map((c) => c.id)
        : undefined,
    };

    // Save active filters for pagination
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
      selectedEmployeeIds: [],
    };
    setFilters(resetFilters);
    setSelectedEmployees([]);
    setSearchTerm("");
    setShowSearchResults(false);

    // Clear active filters
    onFiltersChange?.(null);

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

        {/*Customer*/}
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
          <Label htmlFor="employees" className="text-sm font-medium">
            Nhân viên
          </Label>
          <MultiSelectDropdown
            options={employees.map((e) => ({ id: e.id, name: e.fullName }))}
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
                          {/* <div className="flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {job.customer?.name || "N/A"}
                            </p>
                          </div> */}
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
