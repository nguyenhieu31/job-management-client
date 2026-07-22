"use client";

import { useEffect, useState } from "react";
import { OrderHistoryTable } from "@/components/services/order-history-table";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  getAllOrdersAction,
  searchAdminOrdersAction,
  updateOrderStatusAction,
} from "@/store/slice/orders/Orders";
import type { OrderStatus } from "@/types/orders";
import { toast } from "react-toastify";

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 16;

export default function ManagerOrdersPage() {
  const dispatch = useAppDispatch();
  const { roleName } = useAppSelector((state) => state.authenticate);
  const { orders: ordersPage, loading, searching, error } = useAppSelector(
    (state) => state.order,
  );
  const orders = ordersPage?.data || [];
  const totalPages = ordersPage?.totalPages;
  const totalItems = ordersPage?.totalElements;
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (roleName !== "MANAGER") return;
    dispatch(
      getAllOrdersAction({
        pageNumber: DEFAULT_PAGE_NUMBER,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    );
  }, [dispatch, roleName]);

  const handleApplyFilters = (filters: {
    keyword: string;
    status: OrderStatus | null;
    pageNumber: number;
    pageSize: number;
  }) => {
    const hasKeyword = filters.keyword.length > 0;
    if (hasKeyword || filters.status !== null) {
      dispatch(
        searchAdminOrdersAction({
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
          keyword: hasKeyword ? filters.keyword : null,
          status: filters.status,
        }),
      );
    } else {
      dispatch(
        getAllOrdersAction({
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
        }),
      );
    }
  };

  const handleResetFilters = () => {
    dispatch(
      getAllOrdersAction({
        pageNumber: DEFAULT_PAGE_NUMBER,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    );
  };

  const handleStatusChange = async (
    orderId: number,
    status: OrderStatus,
    rejectNote?: string,
    linkDone?: string,
    doneNote?: string,
  ) => {
    setActionLoading(true);
    try {
      await dispatch(
        updateOrderStatusAction({
          id: orderId,
          status,
          rejectNote: rejectNote ?? null,
          linkDone: linkDone ?? null,
          doneNote: doneNote ?? null,
        }),
      ).unwrap();
      toast.success("Order status updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Cannot update order status");
    } finally {
      setActionLoading(false);
    }
  };

  if (roleName && roleName !== "MANAGER") {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Order Management
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          View all customer orders, filter by status, and update progress step by step
          (View → Confirm → Accept → Complete).
        </p>
      </div>

      <OrderHistoryTable
        mode="manager"
        orders={orders}
        loading={loading}
        searching={searching}
        error={error}
        totalPages={totalPages}
        totalItems={totalItems}
        actionLoading={actionLoading}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
