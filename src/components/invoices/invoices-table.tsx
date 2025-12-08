"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Send, X, Search } from "lucide-react";
import type { InvoiceResponse, InvoiceStatus } from "@/types/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/jobs/pagination";
import { PageResponse } from "../types/Page";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface InvoicesTableProps {
  invoices: PageResponse<InvoiceResponse[]> | undefined;
  loading?: boolean;
  onViewInvoice?: (invoice: InvoiceResponse) => void;
  onSendInvoice?: (invoice: InvoiceResponse) => void;
  onCancelInvoice?: (invoice: InvoiceResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onStatusChange: (status: InvoiceStatus | "ALL") => void;
  onSearch: (keyword: string) => void;
  status: InvoiceStatus | "ALL";
}

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Đã tạo hóa đơn",
  PENDING: "Chờ Thanh Toán",
  PAID: "Đã Thanh Toán",
  CANCELLED: "Bị Hủy",
};

export function InvoicesTable({
  invoices,
  loading = false,
  onSendInvoice,
  onCancelInvoice,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onSearch,
  status,
}: InvoicesTableProps) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchKeyword);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, onSearch]);

  const handleSendClick = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setSendDialogOpen(true);
  };

  const handleCancelClick = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setCancelDialogOpen(true);
  };

  const confirmSend = () => {
    if (selectedInvoice) {
      onSendInvoice?.(selectedInvoice);
    }
    setSendDialogOpen(false);
    setSelectedInvoice(null);
  };

  const confirmCancel = () => {
    if (selectedInvoice) {
      onCancelInvoice?.(selectedInvoice);
    }
    setCancelDialogOpen(false);
    setSelectedInvoice(null);
  };

  const renderActions = (invoice: InvoiceResponse) => {
    const status = invoice.status as InvoiceStatus;
    const viewLink = invoice.detail?.metadata?.invoicer_view_url || "";

    return (
      <div className="flex items-center justify-center gap-2">
        {/* View button - visible for all statuses */}
        <Link
          href={viewLink}
          target="_blank"
          className="h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Xem hoá đơn"
        >
          <Eye className="h-4 w-4" />
        </Link>

        {/* DRAFT: Show Send button */}
        {status === "DRAFT" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center"
            title="Gửi hoá đơn"
            onClick={() => handleSendClick(invoice)}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}

        {/* PENDING: Show Cancel button */}
        {status === "PENDING" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex items-center justify-center"
            title="Hủy hoá đơn"
            onClick={() => handleCancelClick(invoice)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* PAID: Only show View (no additional actions) */}
        {/* CANCELLED: Only show View (no additional actions) */}
      </div>
    );
  };
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-3 text-muted-foreground">Đang tải hoá đơn...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // if (invoices === undefined || (invoices.data && invoices.data.length === 0)) {
  //   return (
  //     <Card>
  //       <CardContent className="flex flex-col items-center justify-center py-12 text-center">
  //         <p className="text-muted-foreground text-lg">Chưa có hoá đơn</p>
  //         <p className="text-muted-foreground text-sm mt-1">
  //           Tạo hoá đơn từ các công việc đã hoàn thành bên trên
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Danh Sách Hoá Đơn</CardTitle>
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm hoá đơn..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Lọc theo trạng thái:</span>
              <Select
                value={status}
                onValueChange={(value) => onStatusChange(value as InvoiceStatus | "ALL")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="DRAFT">Đã tạo hoá đơn</SelectItem>
                  <SelectItem value="PENDING">Chờ Thanh Toán</SelectItem>
                  <SelectItem value="PAID">Đã Thanh Toán</SelectItem>
                  <SelectItem value="CANCELLED">Bị Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border-r font-bold">STT</TableHead>
                <TableHead className="text-center border-r font-bold">Số Hoá Đơn</TableHead>
                <TableHead className="text-center border-r font-bold">Khách Hàng</TableHead>
                <TableHead className="text-center border-r font-bold">Số Công Việc</TableHead>
                <TableHead className="text-right border-r font-bold">Tổng Tiền</TableHead>
                <TableHead className="text-center border-r font-bold">Trạng Thái</TableHead>
                <TableHead className="text-center border-r font-bold">Ngày Tạo</TableHead>
                <TableHead className="text-center font-bold">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && invoices !== undefined && invoices.data ? invoices.data.map((invoice, index) => {
                const customerInfo = invoice.primaryRecipients?.map((recipient: any) => {
                  return {
                    name: recipient.billing_info?.name?.full_name || "Unknown",
                    email: recipient.billing_info?.email_address || "N/A",
                  };
                })?.[0] || { name: "Unknown", email: "N/A" };

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-center border-r font-medium">
                      {(invoices.pageNumber * invoices.pageSize) + index + 1}
                    </TableCell>
                    <TableCell className="text-center border-r font-semibold">
                      {invoice.invoiceId}
                    </TableCell>
                    <TableCell className="border-r">
                      <div>
                        <p className="font-medium">{customerInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center border-r font-medium">
                      {invoice.numberJob || 0}
                    </TableCell>
                    <TableCell className="text-right border-r font-bold text-lg">
                      {formatCurrency(invoice.dueAmount?.value || 0)}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      <Badge
                        variant="outline"
                        className={invoiceStatusColors[invoice.status as InvoiceStatus] ?? ""}
                      >
                        {invoiceStatusLabels[invoice.status as InvoiceStatus] || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center border-r text-sm">
                      {formatDate(invoice.createdAt ? invoice.createdAt.toString() : "")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderActions(invoice)}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground text-lg">Chưa có hoá đơn</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Tạo hoá đơn từ các công việc đã hoàn thành bên trên
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
          pagination={{
            currentPage: invoices ? invoices.pageNumber + 1 : 1,
            pageSize: invoices ? invoices.pageSize : 10,
            totalItems: invoices ? invoices.totalElements : 0,
            totalPages: invoices ? invoices.totalPages : 0,
          }}
          totalElements={invoices ? invoices.totalElements : 0}
          totalPages={invoices ? invoices.totalPages : 0}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </CardContent>

      {/* Send Invoice Confirmation Dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi hoá đơn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn gửi hoá đơn <strong>{selectedInvoice?.invoiceId}</strong> cho khách hàng không?
              <br />
              Sau khi gửi, trạng thái hoá đơn sẽ chuyển sang &quot;Chờ Thanh Toán&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend} className="bg-blue-600 hover:bg-blue-700">
              Xác nhận gửi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invoice Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy hoá đơn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy hoá đơn <strong>{selectedInvoice?.invoiceId}</strong> không?
              <br />
              <span className="text-red-600 font-semibold">Hành động này không thể hoàn tác!</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
