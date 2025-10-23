"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmployeePayroll } from "@/types/payroll";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useState } from "react";
import { toast } from "react-toastify";
import { formatCurrencyVND } from "@/lib/utils";
import { UpdatePayrollStatusAction } from "@/store/slice/payroll/Payroll";

interface PayrollActionDialogProps {
  payroll: EmployeePayroll;
  actionType: "approve" | "reject" | "pay";
  open: boolean;
  onOpenChange: (open: boolean, refreshed?: boolean) => void;
}

export default function PayrollActionDialog({
  payroll,
  actionType,
  open,
  onOpenChange,
}: PayrollActionDialogProps) {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loading = useAppSelector((state) => state.payroll.loading);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      if (actionType === "approve") {
        await dispatch(UpdatePayrollStatusAction({
          payrollId: payroll.id,
          status: "APPROVED"
        }));
        toast.success("Bảng lương đã được duyệt");
      } else if (actionType === "pay") {
        await dispatch(UpdatePayrollStatusAction({
          payrollId: payroll.id,
          status: "PAID"
        }));
        toast.success("Bảng lương đã được đánh dấu là đã thanh toán");
      }
      setNotes("");
      onOpenChange(false, true);
    } catch {
      toast.error("Không thể thực hiện hành động");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNotes("");
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (actionType) {
      case "approve":
        return "Duyệt Bảng Lương";
      case "reject":
        return "Từ Chối Bảng Lương";
      case "pay":
        return "Đánh Dấu Đã Thanh Toán";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "approve":
        return `Bạn sắp duyệt bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod} với số tiền ${formatCurrencyVND(payroll.totalAmount)}`;
      case "reject":
        return `Bạn sắp từ chối bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod}`;
      case "pay":
        return `Bạn sắp đánh dấu bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod} là đã thanh toán`;
    }
  };

  const getButtonLabel = () => {
    switch (actionType) {
      case "approve":
        return "Duyệt";
      case "reject":
        return "Từ Chối";
      case "pay":
        return "Xác Nhận";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{getDescription()}</p>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Lý Do Từ Chối *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Nhập lý do từ chối bảng lương..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className={
              actionType === "reject"
                ? "bg-red-600 hover:bg-red-700"
                : actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {isLoading || loading ? "Đang xử lý..." : getButtonLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
