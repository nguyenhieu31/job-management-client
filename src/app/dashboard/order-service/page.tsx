"use client";

import { useEffect, useState } from "react";
import { AddServiceForm } from "@/components/services/add-service-form";
import { OrderHistoryTable } from "@/components/services/order-history-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  cancelMyOrderAction,
  getMyOrdersAction,
  requestRevisionAction,
  searchMyOrdersAction,
  submitOrderAction,
} from "@/store/slice/orders/Orders";
import type { CreateOrderRequestBody, OrderStatus } from "@/types/orders";
import { AddServiceFormState, computeEstimatedPrice } from "@/types/services";
import { toast } from "react-toastify";
import useRouter from "@/hooks/use-router";
import Loader from "@/components/ui/loader";

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 10;

export default function OrderServicePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { roleName } = useAppSelector(
    (state) => state.authenticate,
  );
  const { orders: ordersPage, loading, searching, error, submitting, submitError } =
    useAppSelector((state) => state.order);
  const orders = ordersPage?.data || [];
  const totalPages = ordersPage?.totalPages;
  const totalItems = ordersPage?.totalElements;

  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    if (roleName === "MANAGER") {
      router.replace("/dashboard/orders");
      return;
    }
    if (roleName === "CUSTOMER") {
      dispatch(
        getMyOrdersAction({
          pageNumber: DEFAULT_PAGE_NUMBER,
          pageSize: DEFAULT_PAGE_SIZE,
        }),
      );
    }
  }, [dispatch, roleName, router]);

  const handleFormSubmit = async (
    state: AddServiceFormState,
    attachments: { file: File; type: "image" | "video" }[] = [],
  ) => {
    const body: CreateOrderRequestBody = {
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      customerPhone: "specified",
      orderNotes: state.orderNotes,
      configuration: JSON.parse(JSON.stringify(state)),
      estimatedPrice: computeEstimatedPrice(state),
    };

    try {
      await dispatch(
        submitOrderAction({
          body,
          files: attachments.map((a) => a.file),
        }),
      ).unwrap();
      setOpenForm(false);
      toast.success("Order submitted successfully!");
      dispatch(
        getMyOrdersAction({
          pageNumber: DEFAULT_PAGE_NUMBER,
          pageSize: DEFAULT_PAGE_SIZE,
        }),
      );
    } catch (err: any) {
      toast.error(
        err?.message ||
          submitError ||
          "Cannot submit order. Please try again.",
      );
    }
  };

  const handleApplyFilters = (filters: {
    keyword: string;
    status: OrderStatus | null;
    pageNumber: number;
    pageSize: number;
  }) => {
    const hasKeyword = filters.keyword.length > 0;
    if (hasKeyword || filters.status !== null) {
      dispatch(
        searchMyOrdersAction({
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
          keyword: hasKeyword ? filters.keyword : null,
          status: filters.status,
        }),
      );
    } else {
      dispatch(
        getMyOrdersAction({
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
        }),
      );
    }
  };

  const handleResetFilters = () => {
    dispatch(
      getMyOrdersAction({
        pageNumber: DEFAULT_PAGE_NUMBER,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    );
  };

  const handleStatusChange = async (
    orderId: number,
    status: OrderStatus,
    rejectNote?: string,
  ) => {
    if (status === "CANCELLED") {
      try {
        await dispatch(
          cancelMyOrderAction({ id: orderId, cancelNote: rejectNote }),
        ).unwrap();
        toast.success("Order cancelled successfully");
        dispatch(
          getMyOrdersAction({
            pageNumber: DEFAULT_PAGE_NUMBER,
            pageSize: DEFAULT_PAGE_SIZE,
          }),
        );
      } catch (err: any) {
        toast.error(err?.message || "Cannot cancel order");
      }
    }
  };

  const handleRequestRevision = async (orderId: number, revisionNote: string) => {
    try {
      await dispatch(
        requestRevisionAction({ id: orderId, revisionNote }),
      ).unwrap();
      toast.success("Revision request submitted. The team will review it.");
    } catch (err: any) {
      toast.error(err?.message || "Cannot request revision. Please try again.");
    }
  };

  if (!roleName) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader width={50} height={50} />
      </div>
    );
  }

  if (roleName === "MANAGER") {
    return (
        <div className="flex justify-center items-center h-40 text-sm text-muted-foreground">
          Redirecting to order management…
        </div>
    );
  }

  if (roleName !== "CUSTOMER") {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        This page is for customer accounts only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Book Service
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Choose the photo and video editing service that fits your needs.
            Fill in the details and we will contact you to confirm as soon as possible.
          </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => setOpenForm(true)}
            disabled={submitting}
            size="lg"
          >
            Book New Service
          </Button>
        </div>

        <OrderHistoryTable
          mode="customer"
          orders={orders}
          loading={loading}
          searching={searching}
          error={error}
          totalPages={totalPages}
          totalItems={totalItems}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onStatusChange={handleStatusChange}
          onRequestRevision={handleRequestRevision}
        />

        <Dialog
          open={openForm}
          onOpenChange={(open) => {
            if (!submitting) setOpenForm(open);
          }}
        >
          <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Book New Service</DialogTitle>
            </DialogHeader>
            <AddServiceForm
              submitting={submitting}
              onSubmit={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
