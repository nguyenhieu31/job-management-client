"use client";

import { AddServiceForm } from "@/components/services/add-service-form";
import { toast } from "react-toastify";
import {
  computeEstimatedPrice,
  type AddServiceFormState,
} from "@/types/services";
import type { CreateOrderRequestBody } from "@/types/orders";

export default function OrderServicePage() {
  const handleSubmit = (state: AddServiceFormState) => {
    const estimatedPrice = computeEstimatedPrice(state);
    const body: CreateOrderRequestBody = {
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      customerPhone: state.customerPhone || "unspecified",
      orderNotes: state.orderNotes,
      configuration: JSON.parse(JSON.stringify(state)),
      estimatedPrice,
    };
    console.log("Order submitted:", body);
    toast.success("Đơn hàng đã được gửi thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Đặt Dịch Vụ
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Chọn dịch vụ chỉnh sửa ảnh và video phù hợp với nhu cầu của bạn. 
          Điền thông tin chi tiết và chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
        </p>
      </div>

      <AddServiceForm onSubmit={handleSubmit} />
    </div>
  );
}
