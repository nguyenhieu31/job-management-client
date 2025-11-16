"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
import { Filter } from "lucide-react";

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
  const [selectedEmployees, setSelectedEmployees] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    { id: number; name: string }[]
  >([]);

  // Filter payrolls based on selected employees and statuses
  const filteredPayrolls = useMemo(() => {
    const statusOptions = [
      { id: 1, name: "Chờ Duyệt", value: "PENDING" },
      { id: 2, name: "Đã Duyệt", value: "APPROVED" },
      { id: 3, name: "Đã Thanh Toán", value: "PAID" },
      { id: 4, name: "Từ Chối", value: "REJECTED" },
    ];

    let filtered = payrolls;

    // Filter by employees
    if (selectedEmployees.length > 0) {
      const selectedIds = selectedEmployees.map((e: { id: number; name: string }) => e.id);
      filtered = filtered.filter((payroll: any) =>
        selectedIds.includes(payroll.employee.id)
      );
    }

    // Filter by statuses
    if (selectedStatuses.length > 0) {
      const selectedStatusValues = selectedStatuses.map((s: { id: number; name: string }) => {
        const statusOption = statusOptions.find((opt) => opt.id === s.id);
        return statusOption?.value;
      });
      filtered = filtered.filter((payroll: any) =>
        selectedStatusValues.includes(payroll.payrollStatus)
      );
    }

    return filtered;
  }, [payrolls, selectedEmployees, selectedStatuses]);

  // Calculate filtered summary
  const filteredSummary = useMemo(() => {
    if (!summary || selectedEmployees.length === 0) {
      return summary;
    }
    const totalEmployees = filteredPayrolls.length;
    const totalAmount = filteredPayrolls.reduce((sum: number, p: any) => sum + p.totalAmount, 0);
    const approvedAmount = filteredPayrolls
      .filter((p: any) => p.payrollStatus === "APPROVED" || p.payrollStatus === "PAID")
      .reduce((sum: number, p: any) => sum + p.totalAmount, 0);
    const paidAmount = filteredPayrolls
      .filter((p: any) => p.payrollStatus === "PAID")
      .reduce((sum: number, p: any) => sum + p.totalAmount, 0);
    
    return {
      totalEmployees,
      totalAmount,
      approvedAmount,
      paidAmount,
    };
  }, [summary, filteredPayrolls, selectedEmployees.length]);

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

      {/* Filters */}
      {!loading && payrolls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <Filter className="inline h-5 w-5 mr-2" />
              Bộ Lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Employee Filter */}
              <div className="space-y-2">
                <Label htmlFor="employees" className="text-sm font-medium">
                  Lọc Theo Nhân Viên
                </Label>
                <MultiSelectDropdown
                  options={payrolls.map((p: any) => ({
                    id: p.employee.id,
                    name: p.employee.fullName,
                  }))}
                  placeholder="Chọn nhân viên..."
                  onChange={(values) => setSelectedEmployees(values)}
                  defaultValue={selectedEmployees}
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="statuses" className="text-sm font-medium">
                  Lọc Theo Trạng Thái
                </Label>
                <MultiSelectDropdown
                  options={[
                    { id: 1, name: "Chờ Duyệt" },
                    { id: 2, name: "Đã Duyệt" },
                    { id: 3, name: "Đã Thanh Toán" },
                    { id: 4, name: "Từ Chối" },
                  ]}
                  placeholder="Chọn trạng thái..."
                  onChange={(values) => setSelectedStatuses(values)}
                  defaultValue={selectedStatuses}
                  className="w-full"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedEmployees.length > 0 || selectedStatuses.length > 0) && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    setSelectedEmployees([]);
                    setSelectedStatuses([]);
                  }}
                >
                  Xóa Tất Cả Bộ Lọc
                </Button>
              </div>
            )}

            {/* Filter Summary */}
            {(selectedEmployees.length > 0 || selectedStatuses.length > 0) && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Hiển thị{" "}
                  <span className="font-semibold text-foreground">
                    {filteredPayrolls.length}
                  </span>{" "}
                  nhân viên (đã lọc từ {payrolls.length} nhân viên)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {filteredSummary && period && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng Nhân Viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSummary.totalEmployees}</div>
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
                {formatCurrencyVND(filteredSummary.totalAmount)}
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
                {formatCurrencyVND(filteredSummary.approvedAmount)}
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
                {formatCurrencyVND(filteredSummary.paidAmount)}
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
            <PayrollTable payrolls={filteredPayrolls} onRefresh={handleRefresh} />
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
