"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerJobSummary } from "@/types/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, Filter, FileSpreadsheet } from "lucide-react";
import { CustomerInfo, JobResponse } from "@/types/jobs";
import { Label } from "@/components/ui/label";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
import { generateExcelInvoice } from "@/lib/excel/generate-invoice-excel";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYPAL_CURRENCIES } from "@/constants/currencies";

interface InvoiceListProps {
  jobsByCustomer: CustomerJobSummary[];
  onCreateInvoice: (customer: CustomerInfo, selectedJob: JobResponse[], currency: string) => void;
  loading?: boolean;
}

export function InvoiceList({
  jobsByCustomer,
  onCreateInvoice,
  loading = false,
}: InvoiceListProps) {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(
    new Set()
  );
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [selectedCustomers, setSelectedCustomers] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<
    Record<number, string>
  >({});

  // Filter customers based on selection
  const filteredCustomers = useMemo(() => {
    if (selectedCustomers.length === 0) {
      return jobsByCustomer;
    }
    const selectedIds = selectedCustomers.map((c) => c.id);
    return jobsByCustomer.filter((customer) =>
      selectedIds.includes(customer.customer.id)
    );
  }, [jobsByCustomer, selectedCustomers]);

  const toggleCustomer = (customerId: number) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const toggleJobSelect = (jobId: number) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAllJobs = (customerId: number, jobs: JobResponse[]) => {
    const newSelected = new Set(selectedJobs);
    const allJobsInCustomer = jobs.every((job) => newSelected.has(job.id));

    if (allJobsInCustomer) {
      jobs.forEach((job) => newSelected.delete(job.id));
    } else {
      jobs.forEach((job) => newSelected.add(job.id));
    }
    setSelectedJobs(newSelected);
  };

  const getSelectedJobsByCustomer = (customerId: number): number[] => {
    return Array.from(selectedJobs).filter((jobId) => {
      const customer = jobsByCustomer.find((c) => c.customer.id === customerId);
      return customer?.jobs.some((j) => j.id === jobId);
    });
  };

  const handleExportExcel = async (customerInfo: CustomerInfo, allJobs: JobResponse[]) => {
    const selectedJobIds = getSelectedJobsByCustomer(customerInfo.id);
    const selectedJobsToExport = allJobs.filter((j) => selectedJobIds.includes(j.id));
    if (selectedJobsToExport.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một công việc để xuất hóa đơn Excel!");
      return;
    }

    const invalidJob = selectedJobsToExport.find(
      (job) => job.filePrice === null || job.outputNumber === null || job.outputNumber === 0 || job.filePrice === 0
    );
    if (invalidJob) {
      toast.error(`Công việc "${invalidJob.caseName}" chưa có tổng tiền. Vui lòng cập nhật trước khi xuất Excel.`);
      return;
    }

    try {
      await generateExcelInvoice(customerInfo, selectedJobsToExport);
      toast.success(`Đã tải xuống hóa đơn Excel cho ${customerInfo.name}!`);
    } catch (err: any) {
      console.error("Excel export error:", err);
      toast.error("Xuất hóa đơn Excel thất bại!");
    }
  };

  if (jobsByCustomer.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Không có công việc chưa thanh toán
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="customers" className="text-sm font-medium">
                <Filter className="inline h-4 w-4 mr-1" />
                Lọc theo Khách Hàng
              </Label>
              <MultiSelectDropdown
                options={jobsByCustomer.map((c) => ({
                  id: c.customer.id,
                  name: c.customer.name,
                }))}
                placeholder="Chọn khách hàng..."
                onChange={(values) => setSelectedCustomers(values)}
                defaultValue={selectedCustomers}
                className="w-full"
              />
            </div>
            {selectedCustomers.length > 0 && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setSelectedCustomers([])}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
          {filteredCustomers.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-semibold text-foreground">{filteredCustomers.length}</span> khách hàng
                {selectedCustomers.length > 0 && (
                  <span> (đã lọc từ {jobsByCustomer.length} khách hàng)</span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer List */}
      {filteredCustomers.map((customer, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCustomer(customer.customer.id)}
                  className="h-6 w-6 p-0"
                >
                  {expandedCustomers.has(customer.customer.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{customer.customer.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.customer.email}
                  </p>
                  {customer.customer.company && (
                    <p className="text-sm text-muted-foreground">
                      {customer.customer.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-lg font-bold">
                    {formatCurrency(customer.totalAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.jobs.length} công việc
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 border-emerald-600 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500 font-medium transition-colors"
                  onClick={() => handleExportExcel(customer.customer, customer.jobs)}
                  disabled={
                    getSelectedJobsByCustomer(customer.customer.id).length === 0 || loading
                  }
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Xuất Excel ({getSelectedJobsByCustomer(customer.customer.id).length})
                </Button>
              </div>
            </div>
          </div>

          {expandedCustomers.has(customer.customer.id) && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={customer.jobs.every((job) =>
                          selectedJobs.has(job.id)
                        )}
                        indeterminate={
                          customer.jobs.some((job) => selectedJobs.has(job.id)) &&
                          !customer.jobs.every((job) => selectedJobs.has(job.id))
                        }
                        onCheckedChange={() =>
                          toggleSelectAllJobs(customer.customer.id, customer.jobs)
                        }
                      />
                    </TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Mã Job</TableHead>
                    <TableHead>Tên Job</TableHead>
                    <TableHead className="text-center">Số file</TableHead>
                    <TableHead className="text-right">Giá file</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    <TableHead className="text-right">Trạng Thái Thanh Toán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.has(job.id)}
                          onCheckedChange={() => toggleJobSelect(job.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{formatDate(job.createdAt)}</TableCell>
                      <TableCell className="font-medium">{job.code}</TableCell>
                      <TableCell>{job.caseName}</TableCell>
                      <TableCell className="text-center">{job.outputNumber}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(job.filePrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(job.filePrice * job.outputNumber)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            job.paymentStatus === "UNPAID"
                              ? "bg-red-500/10 text-red-700 border-red-500/20"
                              : "bg-orange-500/10 text-orange-700 border-orange-500/20"
                          }
                        >
                          {job.paymentStatus === "UNPAID"
                            ? "Chưa Thanh Toán"
                            : "Thanh Toán Một Phần"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t p-4 flex items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                    Đơn vị tiền tệ:
                  </span>
                  <Select
                    value={selectedCurrencies[customer.customer.id] || "USD"}
                    onValueChange={(value) =>
                      setSelectedCurrencies((prev) => ({
                        ...prev,
                        [customer.customer.id]: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {PAYPAL_CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    const selectedJobIds = getSelectedJobsByCustomer(
                      customer.customer.id
                    );
                    const chosenCurrency = selectedCurrencies[customer.customer.id] || "USD";
                    if (selectedJobIds.length > 0) {
                      onCreateInvoice(
                        customer.customer,
                        customer.jobs.filter((job) => selectedJobIds.includes(job.id)),
                        chosenCurrency
                      );
                    }
                  }}
                  disabled={
                    getSelectedJobsByCustomer(customer.customer.id).length === 0 ||
                    loading
                  }
                >
                  Tạo Hoá Đơn ({getSelectedJobsByCustomer(customer.customer.id).length})
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
