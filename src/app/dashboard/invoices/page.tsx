"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  fetchUnpaidJobs,
  createInvoice,
  submitInvoice,
  clearPreviewInvoice,
} from "@/store/slice/invoices/Invoices";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoicePreviewDialog } from "@/components/invoices/invoice-preview-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const { jobsByCustomer, previewInvoice, loading, error } = useAppSelector(
    (state) => state.invoices
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUnpaidJobs());
  }, [dispatch]);

  const handleCreateInvoice = async (
    customerId: number,
    selectedJobIds: number[]
  ) => {
    try {
      const result = await dispatch(
        createInvoice({
          customerId,
          jobIds: selectedJobIds,
          notes: "",
        })
      );

      if (createInvoice.fulfilled.match(result)) {
        toast.success("Tạo hoá đơn thành công!");
      } else {
        toast.error("Tạo hoá đơn thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleSubmitInvoice = async (invoiceId: number) => {
    setSubmitLoading(true);
    try {
      const result = await dispatch(submitInvoice(invoiceId));

      if (submitInvoice.fulfilled.match(result)) {
        toast.success("Gửi hoá đơn thành công!");
        dispatch(clearPreviewInvoice());
        // Refresh data
        dispatch(fetchUnpaidJobs());
      } else {
        toast.error("Gửi hoá đơn thất bại!");
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && jobsByCustomer.length === 0) {
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
      {jobsByCustomer.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Khách Hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobsByCustomer.length}</div>
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
                {jobsByCustomer.reduce((sum: number, c: any) => sum + c.jobs.length, 0)}
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
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  jobsByCustomer.reduce((sum: number, c: any) => sum + c.totalAmount, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice List */}
      <InvoiceList
        jobsByCustomer={jobsByCustomer}
        onCreateInvoice={handleCreateInvoice}
        loading={loading}
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
        onSubmit={handleSubmitInvoice}
        loading={submitLoading}
      />
    </div>
  );
}
