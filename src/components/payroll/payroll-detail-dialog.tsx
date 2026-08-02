"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeePayroll } from "@/types/payroll";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyVND } from "@/lib/utils";

interface PayrollDetailDialogProps {
  payroll: EmployeePayroll;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayrollDetailDialog({
  payroll,
  open,
  onOpenChange,
}: PayrollDetailDialogProps) {

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateEditedFee = (editedNumber: number) => {
    return (editedNumber && editedNumber > 3) ? (editedNumber - 3) * 20000 : 0;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{maxWidth: '60rem'}}>
        <DialogHeader>
          <DialogTitle>Chi Tiết Bảng Lương</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông Tin Nhân Viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên Nhân Viên</p>
                  <p className="font-medium">{payroll.employee.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kỳ Lương</p>
                  <p className="font-medium">{payroll.payrollPeriod}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi Tiết job</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Mã job</th>
                      <th className="text-left py-2 px-2">Ngày</th>
                      <th className="text-left py-2 px-2">Tên job</th>
                      <th className="text-left py-2 px-2">Số lượng output</th>
                      <th className="text-right py-2 px-2">Số Tiền</th>
                      {/* <th className="text-right py-2 px-2">Phí Chỉnh Sửa</th> */}
                      <th className="text-right py-2 px-2">Tổng Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.jobs.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-mono text-xs">{item.code}</td>
                        <td className="py-2 px-2 font-mono text-xs">{formatDate(item.createdAt)}</td>
                        <td className="py-2 px-2">{item.caseName}</td>
                        <td className="py-2 px-2">{item.outputNumber}</td>
                        <td className="py-2 px-2 text-right font-medium">
                          {formatCurrencyVND(item.payPerFile)}
                        </td>
                        {/* <td className="py-2 px-2 text-right font-medium">
                          {formatCurrencyVND(calculateEditedFee(item.editedNumber))}
                        </td> */}
                        <td className="py-2 px-2 text-right font-medium">
                          {formatCurrencyVND(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm Tắt Tài Chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Tổng Công Việc</span>
                <span className="font-semibold">{formatCurrency(payroll.subtotal)}</span>
              </div>

              {payroll.deductions > 0 && (
                <div className="flex justify-between items-center pb-3 border-b text-red-600">
                  <span>Khoản Trừ</span>
                  <span className="font-semibold">
                    -{formatCurrency(payroll.deductions)}
                  </span>
                </div>
              )}

              {payroll.bonus > 0 && (
                <div className="flex justify-between items-center pb-3 border-b text-green-600">
                  <span>Tiền Thưởng</span>
                  <span className="font-semibold">
                    +{formatCurrency(payroll.bonus)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 bg-blue-50 p-3 rounded">
                <span className="font-semibold">Tổng Tiền</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(payroll.total)}
                </span>
              </div>
            </CardContent>
          </Card> */}

          {/* Status & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trạng Thái và Ngày Xử Lý</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Trạng Thái:</span>
                <Badge className={getStatusColor(payroll.payrollStatus)}>
                  {payroll.payrollStatus === "PENDING" && "Chờ Duyệt"}
                  {payroll.payrollStatus === "APPROVED" && "Đã Duyệt"}
                  {payroll.payrollStatus === "PAID" && "Đã Thanh Toán"}
                  {payroll.payrollStatus === "REJECTED" && "Từ Chối"}
                </Badge>
              </div>

              {payroll.approveDate && (
                <div className="flex items-center">
                  <span className="text-gray-600">Ngày Duyệt: </span>
                  <span className="ml-2 font-medium">{formatDate(payroll.approveDate)}</span>
                </div>
              )}

              {payroll.paidDate && (
                <div className="flex items-center">
                  <span className="text-gray-600">Ngày Thanh Toán: </span>
                  <span className="ml-2 font-medium">{formatDate(payroll.paidDate)}</span>
                </div>
              )}

              {payroll.approvedBy && (
                <div className="flex items-center">
                  <span className="text-gray-600">Người duyệt: </span>
                  <span className="ml-2 font-medium">{payroll.approvedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
