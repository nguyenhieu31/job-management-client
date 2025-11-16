"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type {
  UserRole,
  Pagination as PaginationType,
  JobResponse,
} from "@/types/jobs";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import { GetAllJobsAction, SearchJobByConditionsAction } from "@/store/slice/jobs/Jobs";
import { PageResponse } from "@/components/types/Page";
import { GetAllEmployeesAction } from "@/store/slice/employee/Employee";
import { EmployeeResponse } from "@/types/employees";
import { GetAllCustomersAction } from "@/store/slice/customer/Customer";
import { CustomerResponse } from "@/types/customers";
import { PayrollDayTable } from "@/components/payroll-day/payroll-day-table";
import { FilterBar } from "@/components/payroll-day/filter-bar";
import { Pagination } from "@/components/payroll-day/pagination";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const lastFetchRef = useRef<string | null>(null);
  
  // Store active filters to maintain them during pagination
  const activeFiltersRef = useRef<any>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Get user role from Redux store
  const { roleName, email } = useAppSelector((state) => state.authenticate);
  const {
    jobs,
    loading,
  }: { jobs: PageResponse<JobResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.job);
  const {
    employees,
  }: { employees: PageResponse<EmployeeResponse[]> | undefined } =
    useAppSelector((state) => state.employee);
  const {
    customers,
  }: { customers: PageResponse<CustomerResponse[]> | undefined } =
    useAppSelector((state) => state.customer);

  // Map role from backend to our UserRole type
  const getUserRole = (): UserRole => {
    const role = roleName?.toLowerCase();
    if (role === "manager" || role === "admin") return "manager";
    if (role === "qa") return "qa";
    return "employee";
  };

  const userRole = getUserRole();

  // Handle pagination actions
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
      currentPage: 1,
    }));
  };

  // Memoize filtered employee lists to avoid recreating on every render
  const employeeList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "employee") ||
      [],
    [employees]
  );

  const qaList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "qa") || [],
    [employees]
  );

  const customerList = useMemo(() => customers?.data || [], [customers]);

  // Fetch jobs when pagination changes - this handles navigation back to page
  useEffect(() => {
    if (roleName === undefined) return;

    // Create a unique key for this fetch request
    const fetchKey = `${roleName}-${pagination.currentPage}-${pagination.pageSize}`;

    // Skip if we just fetched with same parameters
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    lastFetchRef.current = fetchKey;

    if (roleName === "MANAGER") {
      // If there are active filters, use SearchJobByConditionsAction instead
      if (activeFiltersRef.current) {
        const payload = {
          ...activeFiltersRef.current,
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
        };
        dispatch(SearchJobByConditionsAction(payload));
      } else {
        // No filters, fetch all jobs
        dispatch(
          GetAllJobsAction({
            pageNumber: pagination.currentPage - 1,
            pageSize: pagination.pageSize,
          })
        );
      }
    }
  }, [pagination.currentPage, pagination.pageSize, roleName, email, dispatch]);

  // Load related data (employees, customers) only for Manager on mount
  useEffect(() => {
    if (roleName === undefined) return;
    if (roleName === "MANAGER") {
      Promise.all([
        dispatch(GetAllEmployeesAction({ pageNumber: 0, pageSize: 100 })),
        dispatch(GetAllCustomersAction({ pageNumber: 0, pageSize: 100 })),
      ]);
    }
  }, [dispatch, roleName]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng Lương Ngày</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý bảng lương theo ngày cho nhân viên của bạn.
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar 
        pagination={pagination} 
        onPageChange={handlePageChange}
        employees={employeeList}
        customers={customerList}
        onFiltersChange={(filters) => {
          activeFiltersRef.current = filters;
        }}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <PayrollDayTable
            jobs={jobs ? jobs.data : []}
            userRole={userRole}
            employees={employeeList}
            qaList={qaList}
            customers={customerList}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={jobs?.totalElements || 0}
            totalPages={jobs?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
