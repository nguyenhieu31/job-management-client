"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { EmployeePayrollTable } from "@/components/payroll/employee-payroll-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyVND } from "@/lib/utils";
import { GetPayrollByEmployeeAction } from "@/store/slice/payroll/Payroll";
import { EmployeePayroll } from "@/types/payroll";

export default function MyPayrollPage() {
  const dispatch = useAppDispatch();
  const { payrolls, loading, error } : {payrolls: EmployeePayroll[];loading:boolean;error: string;} = useAppSelector((state) => state.payroll);
  const { roleName } = useAppSelector((state) => state.authenticate);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (roleName === "EMPLOYEE" || roleName === "QA" || roleName === "SPECIAL") {
      setHasAccess(true);
      dispatch(GetPayrollByEmployeeAction());
    }
  }, [dispatch, roleName]);

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Bạn không có quyền truy cập trang này. Chỉ nhân viên và QA mới có thể xem bảng lương của mình.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate summary statistics
  const summary = {
    totalPayroll: payrolls.length,
    totalEarned: payrolls.reduce((sum: number, p: any) => sum + p.totalAmount, 0),
    totalPending: payrolls.filter((p) => p.payrollStatus === "PENDING").length,
    totalApproved: payrolls.filter((p) => p.payrollStatus === "APPROVED").reduce((sum: number, p) => sum + p.totalAmount, 0),
    totalPaid: payrolls.filter((p) => p.payrollStatus === "PAID").reduce((sum: number, p) => sum + p.totalAmount, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng Lương Của Tôi</h1>
        <p className="text-muted-foreground mt-2">
          Xem lịch sử bảng lương và chi tiết thanh toán
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Payroll */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Kỳ Lương
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalPayroll}</div>
            <p className="text-xs text-muted-foreground mt-1">kỳ</p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Thu Nhập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrencyVND(summary.totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">tất cả</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Chờ Duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.totalPending}</div>
            <p className="text-xs text-muted-foreground mt-1">kỳ</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Đã Duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrencyVND(summary.totalApproved)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">chờ thanh toán</p>
          </CardContent>
        </Card>

        {/* Paid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Đã Thanh Toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrencyVND(summary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">hoàn tất</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Bảng Lương</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeePayrollTable payrolls={payrolls} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
