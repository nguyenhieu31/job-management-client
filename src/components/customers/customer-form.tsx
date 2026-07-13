"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableDropdown from "@/components/ui/search-able-dropdown";
import type { CustomerResponse } from "@/types/customers";
import type { EmployeeResponse } from "@/types/employees";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customer: Partial<CustomerResponse>) => void;
  editingCustomer: CustomerResponse | null;
  sales: EmployeeResponse[];
}

export function CustomerForm({
  open,
  onOpenChange,
  onSubmit,
  editingCustomer,
  sales,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    customerCode: "",
    assignedSaleId: 0,
    isJobAccount: true,
    isVideoAccount: true,
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        company: editingCustomer.company,
        customerCode: editingCustomer.customerCode || "",
        assignedSaleId: editingCustomer.assignedSaleId || 0,
        isJobAccount: editingCustomer.isJobAccount,
        isVideoAccount: editingCustomer.isVideoAccount,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        customerCode: "",
        assignedSaleId: 0,
        isJobAccount: true,
        isVideoAccount: true,
      });
    }
  }, [editingCustomer, open]);

  const saleOptions = sales.map((s) => ({
    id: s.id,
    name: s.fullName + (s.code ? ` (${s.code})` : ""),
  }));

  const currentSale = saleOptions.find((o) => o.id === formData.assignedSaleId) || null;

  const handleSaleChange = (option: { id: number; name: string | number } | null) => {
    setFormData({ ...formData, assignedSaleId: option ? option.id : 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customer: Partial<CustomerResponse> = {
      ...(editingCustomer && { id: editingCustomer.id }),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      customerCode: formData.customerCode || undefined,
      ...(formData.assignedSaleId > 0 && { assignedSaleId: formData.assignedSaleId }),
      isJobAccount: formData.isJobAccount,
      isVideoAccount: formData.isVideoAccount,
    };

    onSubmit(customer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCustomer ? "Chỉnh Sửa Khách Hàng" : "Thêm Khách Hàng Mới"}
          </DialogTitle>
          <DialogDescription>
            {editingCustomer
              ? "Cập nhật thông tin khách hàng"
              : "Điền thông tin để tạo khách hàng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ Tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Invoice</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="khachhang@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Công Ty</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Công ty ABC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCode">Mã Khách Hàng</Label>
            <Input
              id="customerCode"
              value={formData.customerCode}
              onChange={(e) =>
                setFormData({ ...formData, customerCode: e.target.value })
              }
              placeholder="VD: ACME-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Sale Phụ Trách</Label>
            <SearchableDropdown
              options={saleOptions}
              defaultValue={currentSale}
              onChange={handleSaleChange}
              placeholder="Chọn sale..."
              type="text"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isJobAccount"
              checked={formData.isJobAccount}
              onChange={(e) =>
                setFormData({ ...formData, isJobAccount: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isJobAccount" className="cursor-pointer">
              Khách Hàng Công Việc
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVideoAccount"
              checked={formData.isVideoAccount}
              onChange={(e) =>
                setFormData({ ...formData, isVideoAccount: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isVideoAccount" className="cursor-pointer">
              Khách Hàng Video
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingCustomer ? "Cập Nhật" : "Tạo Mới"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
