"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFilterBar } from "@/components/customers/customer-filter-bar";
import { Pagination } from "@/components/jobs/pagination";
import type {
  CustomerResponse,
  CustomerFilters,
  CustomerPagination,
  CustomerRequest,
} from "@/types/customers";
import type { EmployeeResponse } from "@/types/employees";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import { CreateCustomerAction, DeleteCustomerAction, GetAllCustomersAction, SearchCustomersAction, UpdateCustomerAction } from "@/store/slice/customer/Customer";
import { PageResponse } from "@/components/types/Page";
import { getSalesForDropdown } from "@/services/CustomerApi";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [sales, setSales] = useState<EmployeeResponse[]>([]);

  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
  });

  const [pagination, setPagination] = useState<CustomerPagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const { roleName, id } = useAppSelector((state) => state.authenticate);
  const {
    customers,
    loading,
  }: { customers: PageResponse<CustomerResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.customer);

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.data;
  }, [customers]);

  const [activeFilters, setActiveFilters] = useState<{keyword: string; saleId?: number} | null>(null);

  useEffect(() => {
    getSalesForDropdown().then((res) => {
      if (res?.data) setSales(res.data);
    }).catch(() => {});
  }, []);

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setActiveFilters({ keyword: filters.search, saleId: filters.saleId });
  };

  const handleResetFilters = () => {
    const resetFilters: CustomerFilters = {
      search: "",
      saleId: undefined,
    };
    setFilters(resetFilters);
    setActiveFilters(null);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

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

  const handleAddCustomer = async (customer: Partial<CustomerRequest>) => {
    if (customer.id) {
      const payload: CustomerRequest = {
        id: customer.id,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        customerCode: customer.customerCode || "",
        saleIds: customer.saleIds || [],
        isJobAccount: customer.isJobAccount ?? true,
        isVideoAccount: customer.isVideoAccount ?? true,
      };
      await dispatch(UpdateCustomerAction(payload));
      setEditingCustomer(null);
    } else {
      const payload: CustomerRequest = {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        customerCode: customer.customerCode || "",
        saleIds: customer.saleIds || [],
        isJobAccount: customer.isJobAccount ?? true,
        isVideoAccount: customer.isVideoAccount ?? true,
      };
      await dispatch(CreateCustomerAction(payload));
    }
  };

  const handleEditCustomer = (customer: CustomerResponse) => {
    if (roleName === "SALER") return;
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDeleteCustomer = async (id: number) => {
    if (roleName === "SALER") return;
    if(!id) return
    await dispatch(DeleteCustomerAction(id));
    fetchCustomers();
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingCustomer(null);
    }
  };

  const fetchCustomers = useCallback(() => {
    if (roleName === undefined) return;

    const isSaler = roleName === "SALER";
    const effectiveSaleId = isSaler ? id : activeFilters?.saleId;

    if (activeFilters || isSaler) {
      dispatch(SearchCustomersAction({
        keyword: activeFilters?.keyword || "",
        saleId: effectiveSaleId ?? undefined,
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }));
    } else {
      dispatch(
        GetAllCustomersAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
        })
      );
    }
  }, [dispatch, pagination.currentPage, pagination.pageSize, roleName, id, activeFilters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (customers) {
      setPagination((prev) => ({
        ...prev,
        totalItems: customers.totalElements,
        totalPages: customers.totalPages,
      }));
    }
  }, [customers]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản Lý Khách Hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin khách hàng của bạn
          </p>
        </div>

        <div>
          {roleName === "MANAGER" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="sm:w-auto cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Khách Hàng
            </Button>
          )}
        </div>
      </div>

      <CustomerFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        sales={sales}
      />

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <CustomerTable
            customers={filteredCustomers}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
          />

          <Pagination
            pagination={pagination}
            totalElements={customers?.totalElements || 0}
            totalPages={customers?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      <CustomerForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddCustomer}
        editingCustomer={editingCustomer}
        sales={sales}
      />
    </div>
  );
}
