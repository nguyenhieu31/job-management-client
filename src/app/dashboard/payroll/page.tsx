"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { GetAllPayrollByPeriodAction } from "@/store/slice/payroll/Payroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PayrollTable from "@/components/payroll/payroll-table";
import Loader from "@/components/ui/loader";
import { GetAllPayrollPeriodAction } from "@/store/slice/payroll-period/PayrollPeriod";
import { PayrollPeriod } from "@/types/payrollPeriod";
import { formatCurrencyVND } from "@/lib/utils";

export default function PayrollPage() {
  const dispatch = useAppDispatch();

  const { payrolls, summary, loading } = useAppSelector(
    (state) => state.payroll
  );
  const { payrollPeriods }: { payrollPeriods: PayrollPeriod[] } =
    useAppSelector((state) => state.payrollPeriod);

  const [period, setPeriod] = useState<string>(
    payrollPeriods.length > 0
      ? payrollPeriods[0].period
      : (() => {
          const now = new Date();
          now.setMonth(now.getMonth() - 1); // 👈 giảm 1 tháng
          return now.toISOString().slice(0, 7); // format yyyy-MM
        })()
  );
  useEffect(() => {
    if (payrollPeriods.length === 0) {
      dispatch(GetAllPayrollPeriodAction());
    }
  }, [dispatch, payrollPeriods.length]);

  useEffect(() => {
    if (period) {
      dispatch(GetAllPayrollByPeriodAction(period));
    }
  }, [dispatch, period]);

  const handlePeriodChange = (period: string) => {
    setPeriod(period);
  };

  const handleRefresh = () => {
    if (period) {
      dispatch(GetAllPayrollByPeriodAction(period));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bảng Lương Nhân Viên</h1>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chọn Kỳ Lương</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <Select value={period || ""} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn kỳ lương..." />
            </SelectTrigger>
            <SelectContent>
              {payrollPeriods.map((period: PayrollPeriod) => (
                <SelectItem key={period.id} value={period.period}>
                  {period.period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            Làm Mới
          </Button>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summary && period && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng Nhân Viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng Tiền
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrencyVND(summary.totalAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Đã Duyệt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrencyVND(summary.approvedAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Đã Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyVND(summary.paidAmount)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Table */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader width={50} height={50} />
        </div>
      )}

      {!loading && period && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Danh Sách Bảng Lương - {period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PayrollTable payrolls={payrolls} onRefresh={handleRefresh} />
          </CardContent>
        </Card>
      )}

      {!period && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-gray-500">
              Vui lòng chọn kỳ lương để xem dữ liệu
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
