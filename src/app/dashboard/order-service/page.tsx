"use client";

import { AddServiceForm } from "@/components/services/add-service-form";
import { toast } from "react-toastify";
import type { AddServiceFormState } from "@/types/services";

export default function OrderServicePage() {
  const handleSubmit = (state: AddServiceFormState) => {
    console.log("Order submitted:", state);
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
