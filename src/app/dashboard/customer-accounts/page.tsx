"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerAccountTable } from "@/components/employees/customer-account-table";
import { CustomerAccountForm } from "@/components/employees/customer-account-form";
import { Pagination } from "@/components/jobs/pagination";
import type {
  CustomerAccountResponse,
  CustomerAccountRequest,
  CustomerAccountPagination,
} from "@/types/customer-accounts";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import {
  GetAllCustomerAccountsAction,
  CreateCustomerAccountAction,
  UpdateCustomerAccountAction,
  DeleteCustomerAccountAction,
  ResetPasswordCustomerAccountAction,
  SearchCustomerAccountsAction,
} from "@/store/slice/customer-account/CustomerAccount";
import { PageResponse } from "@/components/types/Page";

export default function CustomerAccountsPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerAccountResponse | null>(null);
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState<CustomerAccountPagination>({
    currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0,
  });

  const {
    customerAccounts,
    loading,
  }: { customerAccounts: PageResponse<CustomerAccountResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.customerAccount);

  const fetchData = useCallback(() => {
    if (keyword) {
      dispatch(SearchCustomerAccountsAction({
        keyword,
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }));
    } else {
      dispatch(GetAllCustomerAccountsAction({
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }));
    }
  }, [dispatch, pagination.currentPage, pagination.pageSize, keyword]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (customerAccounts) {
      setPagination((prev) => ({
        ...prev,
        totalItems: customerAccounts.totalElements,
        totalPages: customerAccounts.totalPages,
      }));
    }
  }, [customerAccounts]);

  const handleAdd = async (account: Partial<CustomerAccountRequest>) => {
    if (account.id) {
      await dispatch(UpdateCustomerAccountAction({
        id: account.id,
        fullName: account.fullName,
        email: account.email || "",
        isActive: account.isActive ?? true,
      }));
      setEditingCustomer(null);
    } else {
      await dispatch(CreateCustomerAccountAction({
        userName: account.userName,
        fullName: account.fullName,
        email: account.email || "",
        password: account.password || "",
      }));
    }
    setFormOpen(false);
    fetchData();
  };

  const handleEdit = (account: CustomerAccountResponse) => {
    setEditingCustomer(account);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    await dispatch(DeleteCustomerAccountAction(id));
    fetchData();
  };

  const handleResetPassword = async (id: number) => {
    await dispatch(ResetPasswordCustomerAccountAction(id));
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingCustomer(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Tài Khoản Khách Hàng</h1>
          <p className="text-muted-foreground mt-1">Quản lý tài khoản khách hàng trong hệ thống</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="sm:w-auto cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Tài Khoản Khách Hàng
        </Button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }
          }}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination((prev) => ({ ...prev, currentPage: 1 }))}
        >
          Tìm kiếm
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <CustomerAccountTable
            customerAccounts={customerAccounts?.data || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
          />

          <Pagination
            pagination={pagination}
            totalElements={customerAccounts?.totalElements || 0}
            totalPages={customerAccounts?.totalPages || 0}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, currentPage: page }))}
            onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }))}
          />
        </>
      )}

      <CustomerAccountForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAdd}
        onResetPassword={handleResetPassword}
        editingAccount={editingCustomer}
      />
    </div>
  );
}
