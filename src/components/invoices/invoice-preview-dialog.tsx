"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import {
  // Table,
  // TableBody,
  // TableCell,
  // TableHead,
  // TableHeader,
  // TableRow,
} from "@/components/ui/table";
import { InvoiceResponse } from "@/types/invoices";
// import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, DollarSign } from "lucide-react";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceResponse | null;
  loading?: boolean;
}

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  invoice,
  loading = false,
}: InvoicePreviewDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Xem Trước Hoá Đơn
          </DialogTitle>
          <DialogDescription>
            Kiểm tra thông tin hoá đơn trước khi gửi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Invoice Header */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold text-primary">
                  Hoá Đơn #{invoice.invoiceId}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ngày tạo: {formatDate(invoice.createdAt.toString())}
                </p>
              </div>
            </div>
          </div> */}

          {/* Customer Information */}
          {/* <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Thông Tin Khách Hàng</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-muted-foreground">Tên</label>
                  <p className="font-medium">{invoice.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{invoice.customerEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Điện Thoại</label>
                  <p className="font-medium">{invoice.customerPhone}</p>
                </div>
                {invoice.customerCompany && (
                  <div>
                    <label className="text-sm text-muted-foreground">Công Ty</label>
                    <p className="font-medium">{invoice.customerCompany}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Thông Tin Hoá Đơn</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-muted-foreground">Mã Hoá Đơn</label>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Trạng Thái</label>
                  <p className="font-medium">
                    {invoice.status === "DRAFT" ? "Nháp" : "Chờ Xử Lý"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Ngày Tạo</label>
                  <p className="font-medium">
                    {formatDate(invoice.createdAt.toString())}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Items Table */}
          {/* <div>
            <h3 className="font-semibold text-lg mb-3">Chi Tiết Công Việc</h3>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Job</TableHead>
                    <TableHead>Tên Job</TableHead>
                    <TableHead className="text-right">Số Tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.jobId}>
                      <TableCell className="font-medium">{item.jobCode}</TableCell>
                      <TableCell>{item.caseName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div> */}

          {/* Summary */}
          {/* <div className="bg-muted/50 p-6 rounded-lg border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tổng Cộng:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Thuế (0%):</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-lg">Tổng Cần Thanh Toán:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div> */}

          {/* Notes */}
          {/* {invoice.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Ghi Chú</h3>
              <p className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )} */}
        </div>

        <DialogFooter className="mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            disabled={loading}
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" />
            {loading ? "Đang Gửi..." : "Gửi Hoá Đơn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
