"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeePayroll, PayrollStatus } from "@/types/payroll";
import { useState } from "react";
import PayrollDetailDialog from "./payroll-detail-dialog";
import PayrollActionDialog from "./payroll-action-dialog";
import { formatCurrencyVND } from "@/lib/utils";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/store/store";
import { updateStateLoading } from "@/store/slice/bank-transaction/BankTransaction";

interface PayrollTableProps {
  payrolls: EmployeePayroll[];
  onRefresh?: () => void;
  banks: any[];
}

export default function PayrollTable({ payrolls, onRefresh, banks }: PayrollTableProps) {
  const dispatch = useAppDispatch();
  const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "pay">("approve");

  const getStatusColor = (status: PayrollStatus) => {
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

  const handleViewDetails = (payroll: EmployeePayroll) => {
    setSelectedPayroll(payroll);
    setDetailDialogOpen(true);
  };

  const handleAction = (payroll: EmployeePayroll, type: "approve" | "pay") => {
    if (type === "pay") {
      // if (!payroll.employee.bankId || !payroll.employee.bankAccountNumber) {
      //   toast.error("Nhân viên chưa có thông tin ngân hàng");
      //   return;
      // }
      dispatch(updateStateLoading(true));
    }
    setSelectedPayroll(payroll);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = (refreshed: boolean) => {
    setActionDialogOpen(false);
    if (refreshed && onRefresh) {
      onRefresh();
    }
  };

  if (payrolls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-gray-500 text-center">
          Không có dữ liệu bảng lương trong kỳ này
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân Viên</TableHead>
              <TableHead>Kỳ Lương</TableHead>
              <TableHead className="text-right">Tổng Tiền</TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="text-center">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((payroll) => (
              <TableRow key={payroll.id}>
                <TableCell className="font-medium">{payroll.employee.fullName}</TableCell>
                <TableCell>{payroll.payrollPeriod}</TableCell>
                <TableCell className="text-right">
                  {formatCurrencyVND(payroll.totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getStatusColor(payroll.payrollStatus)}>
                    {payroll.payrollStatus === "PENDING" && "Chờ Duyệt"}
                    {payroll.payrollStatus === "APPROVED" && "Đã Duyệt"}
                    {payroll.payrollStatus === "PAID" && "Đã Thanh Toán"}
                    {payroll.payrollStatus === "REJECTED" && "Từ Chối"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payroll)}
                      className="text-xs"
                    >
                      Xem Chi Tiết
                    </Button>

                    {payroll.payrollStatus === "PENDING" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAction(payroll, "approve")}
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          Duyệt
                        </Button>
                        {/* <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction(payroll, "reject")}
                          className="text-xs"
                        >
                          Từ Chối
                        </Button> */}
                      </>
                    )}

                    {payroll.payrollStatus === "APPROVED" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction(payroll, "pay")}
                        className="text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        Thanh Toán
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPayroll && (
        <>
          <PayrollDetailDialog
            payroll={selectedPayroll}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
          <PayrollActionDialog
            payroll={selectedPayroll}
            actionType={actionType}
            open={actionDialogOpen}
            onOpenChange={handleCloseActionDialog}
            banks={banks}
          />
        </>
      )}
    </>
  );
}
