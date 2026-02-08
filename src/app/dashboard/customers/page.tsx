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
} from "@/types/customers";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import { CreateCustomerAction, DeleteCustomerAction, GetAllCustomersAction, SearchCustomersAction, UpdateCustomerAction } from "@/store/slice/customer/Customer";
import { PageResponse } from "@/components/types/Page";
import type { CustomerRequest } from "@/types/customers";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);

  // Filters state
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<CustomerPagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Get data from Redux store
  const { roleName } = useAppSelector((state) => state.authenticate);
  const {
    customers,
    loading,
  }: { customers: PageResponse<CustomerResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.customer);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];

    return customers.data;
  }, [customers]);

  // Handle filter actions
  const handleApplyFilters = async () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    const payload = {
      pageNumber: 0,
      pageSize: pagination.pageSize,
      keyword: filters.search,
    }
    await dispatch(SearchCustomersAction(payload));
  };

  const handleResetFilters = () => {
    const resetFilters: CustomerFilters = {
      search: "",
    };
    setFilters(resetFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchCustomers();
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

  const handleAddCustomer = async (customer: Partial<CustomerRequest>) => {
    if (customer.id) {
      const payload = {
        id: customer.id,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        isJobAccount: customer.isJobAccount ?? true,
        isVideoAccount: customer.isVideoAccount ?? true,
      }
      await dispatch(UpdateCustomerAction(payload as CustomerRequest));
      setEditingCustomer(null);
    } else {
      const payload = {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        isJobAccount: customer.isJobAccount ?? true,
        isVideoAccount: customer.isVideoAccount ?? true,
      }
      await dispatch(CreateCustomerAction(payload as CustomerRequest));
    }
  };

  const handleEditCustomer = (customer: CustomerResponse) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDeleteCustomer = async (id: number) => {
    if(!id) return
    await dispatch(DeleteCustomerAction(id));
    // Refresh the customer list
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
    
    dispatch(
      GetAllCustomersAction({
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      })
    );
  }, [dispatch, pagination.currentPage, pagination.pageSize, roleName]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Update pagination totals when customers data changes
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
      {/* Header */}
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

      {/* Filters */}
      <CustomerFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Table */}
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
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={customers?.totalElements || 0}
            totalPages={customers?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form Dialog */}
      <CustomerForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddCustomer}
        editingCustomer={editingCustomer}
      />
    </div>
  );
}
