"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  clearPreviewInvoice,
  GetCustomerJobSummaryAction,
  GetAllInvoicesAction,
  SearchInvoicesAction,
  CreateInvoiceAction,
  updateCustomerCreatedInvoice,
  SendInvoiceAction,
  CancelInvoiceAction,
} from "@/store/slice/invoices/Invoices";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoicePreviewDialog } from "@/components/invoices/invoice-preview-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import {
  CustomerJobSummary,
  InvoiceResponse,
  InvoiceStatus,
} from "@/types/invoices";
import { formatCurrency } from "@/lib/utils";
import { CustomerInfo, JobResponse } from "@/types/jobs";
import { LoadingModal } from "@/components/ui/loading-modal";
import { PageResponse } from "@/components/types/Page";

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const {
    customerJobSummary,
    previewInvoice,
    loading,
    error,
    invoices,
  }: {
    customerJobSummary: CustomerJobSummary[];
    invoices: PageResponse<InvoiceResponse[]> | undefined;
    loading: boolean;
    error: string | null;
    previewInvoice: InvoiceResponse | null;
  } = useAppSelector((state) => state.invoices);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | "ALL">(
    "ALL"
  );
  const [keyword, setKeyword] = useState("");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: InvoiceStatus | "ALL") => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearch = useCallback((searchKeyword: string) => {
    setKeyword(searchKeyword);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    dispatch(GetCustomerJobSummaryAction());
  }, [dispatch]);

  useEffect(() => {
    if (keyword) {
      dispatch(
        SearchInvoicesAction({
          pageNumber: currentPage - 1,
          pageSize,
          invoiceStatus: selectedStatus,
          keyword: keyword.trim(),
        })
      );
    } else {
      dispatch(
        GetAllInvoicesAction({
          pageNumber: currentPage - 1,
          pageSize,
          invoiceStatus: selectedStatus,
        })
      );
    }
  }, [currentPage, pageSize, selectedStatus, keyword, dispatch]);

  const handleCreateInvoice = async (
    customer: CustomerInfo,
    selectedJobs: JobResponse[]
  ) => {
    try {
      // log the customer and selected jobs for debugging
      console.log("Creating invoice for customer:", customer);
      console.log("Selected jobs:", selectedJobs);
      const existJobsNotHasTotalAmount = selectedJobs.find(job => job.filePrice === null || job.outputNumber === null || job.outputNumber === 0 || job.filePrice === 0);
      if (existJobsNotHasTotalAmount) {
        toast.error(`Công việc "${existJobsNotHasTotalAmount.caseName}" chưa có tổng tiền. Vui lòng cập nhật trước khi tạo hoá đơn.`);
        return;
      }
      const payload = {
        customerInfo: customer,
        jobs: selectedJobs,
      };
      console.log("Create invoice payload:", payload);
      const res = await dispatch(CreateInvoiceAction(payload));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Tạo hoá đơn thành công!");
        // Refresh data
        await Promise.all([
          dispatch(
            GetAllInvoicesAction({
              pageNumber: currentPage - 1,
              pageSize,
              invoiceStatus: selectedStatus,
            })
          ),
          dispatch(updateCustomerCreatedInvoice(customer)),
        ]);
      } else {
        toast.error("Tạo hoá đơn thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleSendInvoice = async (invoice: InvoiceResponse) => {
    console.log("Send invoice:", invoice);
    await dispatch(SendInvoiceAction(invoice.invoiceId)),
      await dispatch(
        GetAllInvoicesAction({
          pageNumber: currentPage - 1,
          pageSize,
          invoiceStatus: selectedStatus,
        })
      );
  };

  const handleCancelInvoice = async (invoice: InvoiceResponse) => {
    console.log("Cancel invoice:", invoice);
    await dispatch(CancelInvoiceAction(invoice.invoiceId));
    await dispatch(GetCustomerJobSummaryAction());
    await dispatch(
      GetAllInvoicesAction({
        pageNumber: currentPage - 1,
        pageSize,
        invoiceStatus: selectedStatus,
      })
    );
  };

  if (loading && customerJobSummary.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingModal isOpen={loading} message="Đang xử lý..." />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tạo Hoá Đơn Thanh Toán</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và tạo hoá đơn thanh toán cho các công việc đã hoàn thành
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {customerJobSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Khách Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerJobSummary.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Công Việc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customerJobSummary.reduce(
                  (sum: number, c: any) => sum + c.jobs.length,
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Số Tiền
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(
                  customerJobSummary.reduce(
                    (sum: number, c: any) => sum + c.totalAmount,
                    0
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice List */}
      <InvoiceList
        jobsByCustomer={customerJobSummary}
        onCreateInvoice={handleCreateInvoice}
        loading={loading}
      />

      {/* View Created Invoices */}
      <InvoicesTable
        invoices={invoices ? invoices : undefined}
        loading={loading}
        onSendInvoice={handleSendInvoice}
        onCancelInvoice={handleCancelInvoice}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onStatusChange={handleStatusChange}
        onSearch={handleSearch}
        status={selectedStatus}
      />

      {/* Preview Dialog */}
      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(open) => {
          if (!open) {
            dispatch(clearPreviewInvoice());
          }
        }}
        invoice={previewInvoice}
        loading={loading}
      />
    </div>
  );
}
