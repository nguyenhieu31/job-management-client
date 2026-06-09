"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmployeePayroll } from "@/types/payroll";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatCurrencyVND } from "@/lib/utils";
import { UpdatePayrollStatusAction } from "@/store/slice/payroll/Payroll";
import { BankTransaction, resetData } from "@/store/slice/bank-transaction/BankTransaction";
import { Loader2 } from "lucide-react";

interface PayrollActionDialogProps {
  payroll: EmployeePayroll;
  actionType: "approve" | "reject" | "pay";
  open: boolean;
  onOpenChange: (open: boolean, refreshed?: boolean) => void;
  banks: any[];
}

export default function PayrollActionDialog({
  payroll,
  actionType,
  open,
  onOpenChange,
  banks
}: PayrollActionDialogProps) {
  const dispatch = useAppDispatch();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [qrVersion, setQrVersion] = useState(0);
  const loading = useAppSelector((state) => state.payroll.loading);
  const { data, loading: bankTransferLoading }: {
    data: BankTransaction | null;
    loading: boolean;
  } = useAppSelector((state) => state.bankTransaction);

  useEffect(() => {
    if (banks) {
      const bank = banks.find((bank) => bank.id === payroll.employee.bankId);
      setBankInfo(bank);
    }
    setQrVersion((v) => v + 1);
  }, [banks, payroll.employee.bankId, payroll.totalAmount]);

  useEffect(() => {
    if (data && data.sepayId && !bankTransferLoading) {
      const handleCallUpdatePayrollStatus = async () => {
        try {
          await dispatch(UpdatePayrollStatusAction({
            payrollId: payroll.id,
            status: "PAID",
            sepayId: Number(data.sepayId)
          }));
          toast.success(`Chuyển khoản thành công với nội dung: ${data.content}`);
          onOpenChange(false, true);
          dispatch(resetData());
        } catch (error) {
          toast.error("Cập nhật trạng thái bảng lương thất bại!");
        }
      };

      handleCallUpdatePayrollStatus();
    }
  }, [bankTransferLoading, data, dispatch, onOpenChange]);

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
        dispatch(resetData());
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
    dispatch(resetData());
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (actionType) {
      case "approve":
        return "Duyệt Bảng Lương";
      case "reject":
        return "Từ Chối Bảng Lương";
      case "pay":
        return "Thanh Toán Bảng Lương";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "approve":
        return `Bạn sắp duyệt bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod} với số tiền ${formatCurrencyVND(payroll.totalAmount)}`;
      case "reject":
        return `Bạn sắp từ chối bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod}`;
      case "pay":
        return `Vui lòng quét mã QR bên dưới để thanh toán bảng lương cho ${payroll.employee.fullName} kỳ ${payroll.payrollPeriod}`;
    }
  };

  const getButtonLabel = () => {
    switch (actionType) {
      case "approve":
        return "Duyệt";
      case "reject":
        return "Từ Chối";
      case "pay":
        return "Hoàn tất chuyển khoản";
    }
  };

  const sanitizedEmployeeCode = (payroll.employee.code || "").replace(/[^A-Za-z0-9]/g, "");
  const compactFullName = (payroll.employee.fullName || "")
    .toUpperCase()
    .replace(/\s/g, "");
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

          {actionType === "pay" && (
            <div className="flex flex-col items-center space-y-4 my-4">
              {payroll.employee.bankId && payroll.employee.bankAccountNumber ? (
                bankInfo ? (
                  <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-slate-50 shadow-sm w-full">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <img
                        src={`https://img.vietqr.io/image/${bankInfo.bin}-${payroll.employee.bankAccountNumber}-compact2.png?amount=${payroll.totalAmount}&addInfo=${'SEVQR ' + encodeURIComponent(compactFullName + ' ' + payroll.payrollPeriod + ' ' + `MSNV${sanitizedEmployeeCode}`)}&accountName=${encodeURIComponent(payroll.employee.bankAccountName || '')}&v=${qrVersion}`}
                        alt="VietQR"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                    <div className="text-sm text-center space-y-1 mt-2">
                      <p><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium">{bankInfo.shortName}</span></p>
                      <p><span className="text-gray-500">Số tài khoản:</span> <span className="font-medium">{payroll.employee.bankAccountNumber}</span></p>
                      <p><span className="text-gray-500">Chủ tài khoản:</span> <span className="font-medium">{payroll.employee.bankAccountName}</span></p>
                      <p><span className="text-gray-500">Số tiền:</span> <span className="font-semibold text-blue-600">{formatCurrencyVND(payroll.totalAmount)}</span></p>
                    </div>
                    {bankTransferLoading && (
                      <div className="flex items-center mt-2">
                        <Loader2 className="animate-spin text-blue-500 mr-2" />
                        <span className="text-blue-500 font-medium">Không được thoát khi hệ thống đang xử lý chuyển khoản!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 border rounded-lg w-full">
                    <p className="text-sm text-gray-500">Đang tải mã QR...</p>
                  </div>
                )
              ) : (
                <div className="p-4 border rounded-lg bg-yellow-50 text-yellow-800 text-sm w-full text-center">
                  Nhân viên này chưa được cập nhật đầy đủ thông tin ngân hàng.
                  <br />
                  Bạn vẫn có thể xác nhận nếu đã thanh toán bằng phương thức khác.
                </div>
              )}
            </div>
          )}
        </div>


        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading || loading}>
            Hủy
          </Button>
          {/* {
            actionType !== 'pay' && (
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
            )
          } */}
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
