"use client";

import { useEffect, useMemo, useState } from "react";
import { AddServiceForm } from "@/components/services/add-service-form";
import { OrderHistoryTable } from "@/components/services/order-history-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  getMyOrdersAction,
  searchMyOrdersAction,
  submitOrderAction,
} from "@/store/slice/orders/Orders";
import type { CreateOrderRequestBody, OrderStatus } from "@/types/orders";
import {
  computeEstimatedPrice,
  type AddServiceFormState,
} from "@/types/services";
import { toast } from "react-toastify";

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 16;

export default function OrderServicePage() {
  const dispatch = useAppDispatch();
  const { fullName, email, phoneNumber, roleName } = useAppSelector(
    (state) => state.authenticate,
  );
  const { orders: ordersPage, loading, searching, error, submitting, submitError } =
    useAppSelector((state) => state.order);
  const orders = ordersPage?.data || [];
  const totalPages = ordersPage?.totalPages;
  const totalItems = ordersPage?.totalElements;

  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    dispatch(
      getMyOrdersAction({
        pageNumber: DEFAULT_PAGE_NUMBER,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    );
  }, [dispatch]);

  const initialValues = useMemo<
    Partial<AddServiceFormState> | undefined
  >(() => {
    if (!fullName || !email) return undefined;
    return {
      customerName: fullName,
      customerEmail: email,
      customerPhone: phoneNumber ?? "",
    };
  }, [fullName, email, phoneNumber]);

  const handleFormSubmit = async (
    state: AddServiceFormState,
    attachments: { file: File; type: "image" | "video" }[] = [],
  ) => {
    const customerPhone =
      state.customerPhone?.trim() ||
      phoneNumber?.trim() ||
      "unspecified";

    const body: CreateOrderRequestBody = {
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      customerPhone,
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
      toast.success("Đơn hàng đã được gửi thành công!");
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
          "Không thể gửi đơn hàng. Vui lòng thử lại.",
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Đặt Dịch Vụ
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Chọn dịch vụ chỉnh sửa ảnh và video phù hợp với nhu cầu của bạn.
          Điền thông tin chi tiết và chúng tôi sẽ liên hệ xác nhận trong thời
          gian sớm nhất.
        </p>
      </div>

      {roleName === "CUSTOMER" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setOpenForm(true)}
              disabled={submitting}
              size="lg"
            >
              Đặt dịch vụ mới
            </Button>
          </div>

          <OrderHistoryTable
            orders={orders}
            loading={loading}
            searching={searching}
            error={error}
            totalPages={totalPages}
            totalItems={totalItems}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          <Dialog
            open={openForm}
            onOpenChange={(open) => {
              if (!submitting) setOpenForm(open);
            }}
          >
            <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Đặt dịch vụ mới</DialogTitle>
                <DialogDescription>
                  Thông tin cá nhân được điền tự động từ tài khoản của bạn.
                </DialogDescription>
              </DialogHeader>
              <AddServiceForm
                initial={initialValues}
                disableCustomerFields
                submitting={submitting}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
