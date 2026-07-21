"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { EmployeeForm } from "@/components/employees/employee-form";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeFilterBar } from "@/components/employees/employee-filter-bar";
import { CustomerAccountTable } from "@/components/employees/customer-account-table";
import { CustomerAccountForm } from "@/components/employees/customer-account-form";
import { Pagination } from "@/components/jobs/pagination";
import { Separator } from "@/components/ui/separator";
import type {
  EmployeeResponse,
  EmployeeFilters,
  EmployeePagination,
  RoleDto,
  EmployeeRequest,
} from "@/types/employees";
import type {
  CustomerAccountResponse,
  CustomerAccountRequest,
  CustomerAccountPagination,
} from "@/types/customer-accounts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import { CreateEmployeeAction, DeleteEmployeeAction, GetAllEmployeesAction, ResetPasswordEmployeeAction, SearchEmployeesAction, UpdateEmployeeAction } from "@/store/slice/employee/Employee";
import {
  GetAllCustomerAccountsAction,
  CreateCustomerAccountAction,
  UpdateCustomerAccountAction,
  DeleteCustomerAccountAction,
  ResetPasswordCustomerAccountAction,
  SearchCustomerAccountsAction,
} from "@/store/slice/customer-account/CustomerAccount";
import { PageResponse } from "@/components/types/Page";
import axios from "axios";

const rolesList: RoleDto[] = [
  { id: 2, name: "MANAGER" },
  { id: 3, name: "EMPLOYEE" },
  { id: 4, name: "QA" },
  { id: 5, name: "SPECIAL" },
  { id: 6, name: "SALER" },
];

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
  const [banks, setBanks] = useState<any[]>([]);

  // Customer account state
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccountResponse | null>(null);
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [customerPagination, setCustomerPagination] = useState<CustomerAccountPagination>({
    currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0,
  });

  useEffect(() => {
    const fetchBanks = async () => {
      const res = await axios.get("https://api.vietqr.io/v2/banks");
      const data = res.data;
      setBanks(data.data);
    }
    fetchBanks();
  }, []);

  const [filters, setFilters] = useState<EmployeeFilters>({
    search: "",
    roleId: undefined,
  });

  const [pagination, setPagination] = useState<EmployeePagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const { roleName } = useAppSelector((state) => state.authenticate);
  const {
    employees,
    loading,
  }: { employees: PageResponse<EmployeeResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.employee);
  const {
    customerAccounts,
    loading: customerLoading,
  }: { customerAccounts: PageResponse<CustomerAccountResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.customerAccount);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.data;
  }, [employees]);

  const [activeFilters, setActiveFilters] = useState<{keyword?: string; roleId?: number} | null>(null);

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setActiveFilters({
      keyword: filters.search || undefined,
      roleId: filters.roleId ? Number(filters.roleId) : undefined,
    });
  };

  const handleResetFilters = () => {
    const resetFilters: EmployeeFilters = {
      search: "",
      roleId: undefined,
    };
    setFilters(resetFilters);
    setActiveFilters(null);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

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

  const handleAddEmployee = async (employee: Partial<EmployeeRequest>) => {
    if (employee.id) {
      const payload = {
        id: employee.id,
        email: employee.email || "",
        fullName: employee.fullName || "",
        phoneNumber: employee.phoneNumber || "",
        chatId: employee.chatId || "",
        dateOfBirth: employee.dateOfBirth || new Date(),
        isActive: employee.isActive ?? true,
        role: employee.role || "EMPLOYEE",
        isJobAccount: employee.isJobAccount ?? true,
        isVideoAccount: employee.isVideoAccount ?? true,
        bankId: employee.bankId ?? null,
        bankAccountNumber: employee.bankAccountNumber ?? "",
        bankAccountName: employee.bankAccountName ?? "",
      }
      await dispatch(UpdateEmployeeAction(payload));
      setEditingEmployee(null);
    } else {
      const payload = {
        email: employee.email || "",
        fullName: employee.fullName || "",
        password: employee.password || "123456",
        phoneNumber: employee.phoneNumber || "",
        chatId: employee.chatId || "",
        dateOfBirth: employee.dateOfBirth || new Date(),
        isActive: employee.isActive ?? true,
        role: employee.role || "EMPLOYEE",
        isJobAccount: employee.isJobAccount ?? true,
        isVideoAccount: employee.isVideoAccount ?? true,
        bankId: employee.bankId ?? null,
        bankAccountNumber: employee.bankAccountNumber ?? "",
        bankAccountName: employee.bankAccountName ?? "",
      }
      await dispatch(CreateEmployeeAction(payload));
    }
  };

  const handleEditEmployee = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleResetPassword = async (employeeId: number) => {
    if (!employeeId) return;
    await dispatch(ResetPasswordEmployeeAction(employeeId));
  }

  const handleDeleteEmployee = async (id: number) => {
    // TODO: Call API to delete employee
    console.log("Deleting employee:", id);
    if (!id) return
    await dispatch(DeleteEmployeeAction(id));
    // Refresh the employee list
    fetchEmployees();
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingEmployee(null);
    }
  };

  // Customer account handlers
  const handleCustomerFormClose = (open: boolean) => {
    setCustomerFormOpen(open);
    if (!open) setEditingCustomer(null);
  };

  const handleAddCustomerAccount = async (account: Partial<CustomerAccountRequest>) => {
    if (account.id) {
      await dispatch(UpdateCustomerAccountAction({
        id: account.id,
        userName: account.userName,
        email: account.email || "",
        isActive: account.isActive ?? true,
      }));
      setEditingCustomer(null);
    } else {
      await dispatch(CreateCustomerAccountAction({
        userName: account.userName,
        email: account.email || "",
        password: account.password || "",
      }));
    }
    fetchCustomerAccounts();
  };

  const handleEditCustomer = (account: CustomerAccountResponse) => {
    setEditingCustomer(account);
    setCustomerFormOpen(true);
  };

  const handleDeleteCustomer = async (id: number) => {
    await dispatch(DeleteCustomerAccountAction(id));
    fetchCustomerAccounts();
  };

  const handleResetCustomerPassword = async (id: number) => {
    await dispatch(ResetPasswordCustomerAccountAction(id));
  };

  const handleCustomerPageChange = (page: number) => {
    setCustomerPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleCustomerPageSizeChange = (pageSize: number) => {
    setCustomerPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  };

  const fetchCustomerAccounts = useCallback(() => {
    if (roleName === undefined || roleName !== "MANAGER") return;
    if (customerKeyword) {
      dispatch(SearchCustomerAccountsAction({
        keyword: customerKeyword,
        pageNumber: customerPagination.currentPage - 1,
        pageSize: customerPagination.pageSize,
      }));
    } else {
      dispatch(GetAllCustomerAccountsAction({
        pageNumber: customerPagination.currentPage - 1,
        pageSize: customerPagination.pageSize,
      }));
    }
  }, [dispatch, customerPagination.currentPage, customerPagination.pageSize, roleName, customerKeyword]);

  const fetchEmployees = useCallback(() => {
    if (roleName === undefined) return;

    if (activeFilters) {
      dispatch(SearchEmployeesAction({
        keyword: activeFilters.keyword,
        roleId: activeFilters.roleId,
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }));
    } else {
      dispatch(
        GetAllEmployeesAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
        })
      );
    }
  }, [dispatch, pagination.currentPage, pagination.pageSize, roleName, activeFilters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (roleName === "MANAGER") {
      fetchCustomerAccounts();
    }
  }, [fetchCustomerAccounts, roleName]);

  // Update pagination totals when employees data changes
  useEffect(() => {
    if (employees) {
      setPagination((prev) => ({
        ...prev,
        totalItems: employees.totalElements,
        totalPages: employees.totalPages,
      }));
    }
  }, [employees]);

  // Update customer pagination totals
  useEffect(() => {
    if (customerAccounts) {
      setCustomerPagination((prev) => ({
        ...prev,
        totalItems: customerAccounts.totalElements,
        totalPages: customerAccounts.totalPages,
      }));
    }
  }, [customerAccounts]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản Lý Nhân Viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin nhân viên của bạn
          </p>
        </div>

        <div>
          {roleName === "MANAGER" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="sm:w-auto cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Nhân Viên
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <EmployeeFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        roles={rolesList}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={employees?.totalElements || 0}
            totalPages={employees?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form Dialog */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddEmployee}
        onResetPassword={handleResetPassword}
        editingEmployee={editingEmployee}
        roles={rolesList}
        banks={banks}
      />

      {/* Customer Accounts Section */}
      {roleName === "MANAGER" && (
        <>
          <Separator className="my-4" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold tracking-tight">
                Quản Lý Tài Khoản Khách Hàng
              </h2>
            </div>

            <Button
              onClick={() => setCustomerFormOpen(true)}
              className="sm:w-auto cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Tài Khoản Khách Hàng
            </Button>
          </div>

          {/* Customer search */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={customerKeyword}
              onChange={(e) => setCustomerKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCustomerPagination((prev) => ({ ...prev, currentPage: 1 }));
                  fetchCustomerAccounts();
                }
              }}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomerPagination((prev) => ({ ...prev, currentPage: 1 }));
                fetchCustomerAccounts();
              }}
            >
              Tìm kiếm
            </Button>
          </div>

          {customerLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader width={50} height={50} />
            </div>
          ) : (
            <>
              <CustomerAccountTable
                customerAccounts={customerAccounts?.data || []}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onResetPassword={handleResetCustomerPassword}
                currentPage={customerPagination.currentPage}
                pageSize={customerPagination.pageSize}
              />

              <Pagination
                pagination={customerPagination}
                totalElements={customerAccounts?.totalElements || 0}
                totalPages={customerAccounts?.totalPages || 0}
                onPageChange={handleCustomerPageChange}
                onPageSizeChange={handleCustomerPageSizeChange}
              />
            </>
          )}

          <CustomerAccountForm
            open={customerFormOpen}
            onOpenChange={handleCustomerFormClose}
            onSubmit={handleAddCustomerAccount}
            onResetPassword={handleResetCustomerPassword}
            editingAccount={editingCustomer}
          />
        </>
      )}
    </div>
  );
}
