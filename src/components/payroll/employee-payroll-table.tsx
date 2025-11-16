"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useState } from "react";
import type { EmployeePayroll } from "@/types/payroll";
import { formatCurrencyVND, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmployeePayrollTableProps {
  payrolls: EmployeePayroll[];
  loading?: boolean;
}

const payrollStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  APPROVED: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const payrollStatusLabels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PAID: "Đã thanh toán",
  REJECTED: "Từ chối",
};

export function EmployeePayrollTable({
  payrolls,
  loading = false,
}: EmployeePayrollTableProps) {
  const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);

  const handlePreviewClick = (payroll: EmployeePayroll) => {
    setSelectedPayroll(payroll);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-3 text-muted-foreground">Đang tải bảng lương...</p>
        </div>
      </div>
    );
  }

  if (payrolls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">Chưa có bảng lương</p>
        <p className="text-muted-foreground text-sm mt-1">
          Bảng lương sẽ xuất hiện khi quản lý duyệt hoá đơn của bạn
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center border-r">Kỳ Lương</TableHead>
              <TableHead className="text-center border-r">Tổng Job</TableHead>
              <TableHead className="text-center border-r">Tổng Tiền</TableHead>
              <TableHead className="text-center border-r">Tình Trạng</TableHead>
              <TableHead className="text-center border-r">Duyệt Ngày</TableHead>
              <TableHead className="text-center border-r">Thanh Toán Ngày</TableHead>
              <TableHead className="text-center">Chi Tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((payroll) => (
              <TableRow key={payroll.id}>
                <TableCell className="border-r text-center font-medium">
                  {payroll.payrollPeriod}
                </TableCell>
                <TableCell className="border-r text-center">
                  {payroll.jobs.length}
                </TableCell>
                <TableCell className="border-r text-center font-bold text-lg">
                  {formatCurrencyVND(payroll.totalAmount)}
                </TableCell>
                <TableCell className="border-r text-center">
                  <Badge
                    variant="outline"
                    className={payrollStatusColors[payroll.payrollStatus]}
                  >
                    {payrollStatusLabels[payroll.payrollStatus] || payroll.payrollStatus}
                  </Badge>
                </TableCell>
                <TableCell className="border-r text-center text-sm">
                  {payroll.approveDate
                    ? formatDate(payroll.approveDate.toString())
                    : "—"}
                </TableCell>
                <TableCell className="border-r text-center text-sm">
                  {payroll.paidDate
                    ? formatDate(payroll.paidDate.toString())
                    : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewClick(payroll)}
                    className="h-7 w-7 p-0"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      {selectedPayroll && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3">Chi Tiết Kỳ Lương {selectedPayroll.payrollPeriod}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Số Job:</span>
              <span className="font-medium">{selectedPayroll.jobs.length}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Tổng:</span>
              <span className="text-green-600">{formatCurrencyVND(selectedPayroll.totalAmount)}</span>
            </div>
            {selectedPayroll.approveDate && (
              <div className="flex justify-between pt-2">
                <span>Duyệt Ngày:</span>
                <span className="font-medium">{formatDate(selectedPayroll.approveDate.toString())}</span>
              </div>
            )}
            {selectedPayroll.paidDate && (
              <div className="flex justify-between">
                <span>Thanh Toán Ngày:</span>
                <span className="font-medium">{formatDate(selectedPayroll.paidDate.toString())}</span>
              </div>
            )}
          </div>
          
          {/* Job Items Details */}
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Chi Tiết Công Việc:</h4>
            <div className="bg-background rounded border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium">Mã Job</th>
                    <th className="px-3 py-2 text-left font-medium">Ngày</th>
                    <th className="px-3 py-2 text-left font-medium">Tên Job</th>
                    <th className="px-3 py-2 text-center font-medium">Số lượng</th>
                    <th className="px-3 py-2 text-center font-medium">Tiền</th>
                    <th className="px-3 py-2 text-center font-medium">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPayroll.jobs.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{item.code}</td>
                      <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                      <td className="px-3 py-2">{item.caseName}</td>
                      <td className="px-3 py-2 text-center">{item.outputNumber}</td>
                      <td className="px-3 py-2 text-center">{formatCurrencyVND(item.payPerFile)}</td>
                      <td className="px-3 py-2 text-center font-medium">{formatCurrencyVND(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
