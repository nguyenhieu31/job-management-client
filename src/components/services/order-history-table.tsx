"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderResponse, OrderStatus } from "@/types/orders";
import {
  ASPECT_RATIO_OPTIONS,
  CREATIVE_FREEDOM_OPTIONS,
  MUSIC_OPTIONS,
  PHOTO_SERVICES,
  REALTOR_AGENT_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  UPLOAD_METHOD_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_SERVICES,
  VIDEO_STYLE_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
} from "@/types/services";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Film,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function OrderTablePagination({
  pageNumber,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const startItem = totalItems === 0 ? 0 : pageNumber * pageSize + 1;
  const endItem = Math.min((pageNumber + 1) * pageSize, totalItems);
  const canGoPrevious = pageNumber > 0;
  const canGoNext = pageNumber < totalPages - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Số mục trên trang:
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Hiển thị {startItem}-{endItem} của {totalItems} mục
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
          className="h-8 w-8"
          aria-label="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!canGoPrevious}
          className="h-8 w-8"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm tabular-nums">
          Trang {pageNumber + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!canGoNext}
          className="h-8 w-8"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(totalPages - 1, 0))}
          disabled={!canGoNext}
          className="h-8 w-8"
          aria-label="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Đang chờ",
  REVIEWED: "Đã xem",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  REVIEWED: "secondary",
  CONFIRMED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REJECTED: "destructive",
};

const ORDER_STATUS_BADGE_CLASS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
};

const VND_FORMATTER = new Intl.NumberFormat("vi-VN");

const STATUS_FILTER_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  ...(
    Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]
  ).map(([value, label]) => ({ value, label })),
];

function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return createdAt;
  return parsed.toLocaleString("vi-VN");
}

function formatFileSize(sizeBytes?: number): string {
  if (sizeBytes == null || Number.isNaN(sizeBytes)) return "—";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SERVICE_LABEL_LOOKUP = new Map<string, string>();
for (const svc of [...PHOTO_SERVICES, ...VIDEO_SERVICES]) {
  SERVICE_LABEL_LOOKUP.set(svc.id, svc.label);
}
const lookupLabel = (
  list: { value: string; label: string }[],
  value: string,
): string | undefined => list.find((o) => o.value === value)?.label;

function isFilledString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function ConfigurationDetails({ config }: { config: unknown }) {
  if (!config || typeof config !== "object") return null;
  const obj = config as Record<string, unknown>;

  const serviceLabels = Array.isArray(obj.selectedServices)
    ? (obj.selectedServices as string[])
        .map((id) => SERVICE_LABEL_LOOKUP.get(id) ?? id)
    : [];
  const zaloId = isFilledString(obj.zaloId) ? obj.zaloId : null;
  const instagramHandle = isFilledString(obj.instagramHandle) ? obj.instagramHandle : null;
  const websiteUrl = isFilledString(obj.websiteUrl) ? obj.websiteUrl : null;
  const videoDurationLabel = isFilledString(obj.videoDuration)
    ? (lookupLabel(VIDEO_DURATION_OPTIONS, obj.videoDuration) ?? obj.videoDuration)
    : null;
  const videoStyleLabel = isFilledString(obj.videoStyle)
    ? (lookupLabel(VIDEO_STYLE_OPTIONS, obj.videoStyle) ?? obj.videoStyle)
    : null;
  const aspectRatioLabels = Array.isArray(obj.aspectRatios)
    ? (obj.aspectRatios as string[])
        .map((v) => lookupLabel(ASPECT_RATIO_OPTIONS, v) ?? v)
    : [];
  const musicLabel = isFilledString(obj.music)
    ? (lookupLabel(MUSIC_OPTIONS, obj.music) ?? obj.music)
    : null;
  const realtorAgentLabels = Array.isArray(obj.realtorAgent)
    ? (obj.realtorAgent as string[])
        .map((v) => lookupLabel(REALTOR_AGENT_OPTIONS, v) ?? v)
    : [];
  const textCaptionLabels = Array.isArray(obj.textCaptions)
    ? (obj.textCaptions as string[])
        .map((v) => lookupLabel(TEXT_CAPTIONS_OPTIONS, v) ?? v)
    : [];
  const transitionsLabel = isFilledString(obj.transitions)
    ? (lookupLabel(TRANSITIONS_OPTIONS, obj.transitions) ?? obj.transitions)
    : null;
  const creativeFreedomLabel = isFilledString(obj.creativeFreedom)
    ? (lookupLabel(CREATIVE_FREEDOM_OPTIONS, obj.creativeFreedom) ??
        obj.creativeFreedom)
    : null;
  const uploadMethodLabels = Array.isArray(obj.uploadMethods)
    ? (obj.uploadMethods as string[])
        .map((v) => lookupLabel(UPLOAD_METHOD_OPTIONS, v) ?? v)
    : [];
  const virtualStagingRoomLabels = Array.isArray(obj.virtualStagingRooms)
    ? (obj.virtualStagingRooms as string[])
        .map((v) => lookupLabel(VIRTUAL_STAGING_ROOMS, v) ?? v)
    : [];
  const virtualStagingStyleLabel = isFilledString(obj.virtualStagingStyle)
    ? (lookupLabel(VIRTUAL_STAGING_STYLES, obj.virtualStagingStyle) ??
        obj.virtualStagingStyle)
    : null;

  const renderRow = (
    label: string,
    value: string | null | undefined,
    list?: string[],
  ) => {
    if (list) {
      if (list.length === 0) return null;
      return (
        <div key={label} className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="flex flex-wrap gap-2">
            {list.map((item, idx) => (
              <span
                key={`${label}-${idx}`}
                className="inline-flex items-center rounded-md border bg-muted/40 px-2 py-1 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      );
    }
    if (!value) return null;
    return (
      <div key={label}>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    );
  };

  const hasAnyService =
    serviceLabels.length > 0 ||
    isFilledString(obj.zaloId) ||
    isFilledString(obj.instagramHandle) ||
    isFilledString(obj.websiteUrl) ||
    isFilledString(obj.videoDuration) ||
    isFilledString(obj.videoStyle) ||
    aspectRatioLabels.length > 0 ||
    isFilledString(obj.music) ||
    realtorAgentLabels.length > 0 ||
    textCaptionLabels.length > 0 ||
    isFilledString(obj.transitions) ||
    isFilledString(obj.requiredShots) ||
    isFilledString(obj.excludedShots) ||
    isFilledString(obj.referenceVideos) ||
    isFilledString(obj.creativeFreedom);

  const hasUpload =
    uploadMethodLabels.length > 0 ||
    isFilledString(obj.dropboxLink) ||
    isFilledString(obj.googleDriveLink) ||
    isFilledString(obj.wetransferLink);

  const hasVirtualStaging =
    virtualStagingRoomLabels.length > 0 || virtualStagingStyleLabel !== null;

  if (!hasAnyService && !hasUpload && !hasVirtualStaging) return null;

  return (
    <div className="space-y-6">
      {hasAnyService && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Dịch vụ đã chọn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderRow("Các dịch vụ", null, serviceLabels)}
            {renderRow("Zalo", zaloId)}
            {renderRow("Instagram", instagramHandle)}
            {renderRow("Website", websiteUrl)}
            {renderRow("Thời lượng video", videoDurationLabel)}
            {renderRow("Phong cách chỉnh sửa video", videoStyleLabel)}
            {renderRow("Tỷ lệ khung hình", null, aspectRatioLabels)}
            {renderRow("Nhạc nền", musicLabel)}
            {renderRow("Realtor / Agent", null, realtorAgentLabels)}
            {renderRow("Text & Captions", null, textCaptionLabels)}
            {renderRow("Transitions", transitionsLabel)}
            {renderRow("Required Shots", isFilledString(obj.requiredShots) ? obj.requiredShots : null)}
            {renderRow("Excluded Shots", isFilledString(obj.excludedShots) ? obj.excludedShots : null)}
            {renderRow("Reference Videos", isFilledString(obj.referenceVideos) ? obj.referenceVideos : null)}
            {renderRow("Creative Freedom", creativeFreedomLabel)}
          </div>
        </section>
      )}

      {hasVirtualStaging && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Virtual Staging
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderRow("Loại phòng", null, virtualStagingRoomLabels)}
            {renderRow("Style", virtualStagingStyleLabel)}
          </div>
        </section>
      )}

      {hasUpload && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tải lên tệp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {renderRow("Phương thức tải", null, uploadMethodLabels)}
            {renderRow("Dropbox link", isFilledString(obj.dropboxLink) ? obj.dropboxLink : null)}
            {renderRow("Google Drive link", isFilledString(obj.googleDriveLink) ? obj.googleDriveLink : null)}
            {renderRow("WeTransfer link", isFilledString(obj.wetransferLink) ? obj.wetransferLink : null)}
          </div>
        </section>
      )}
    </div>
  );
}

interface OrderDetailDialogProps {
  order: OrderResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const variant = ORDER_STATUS_BADGE_VARIANT[order.status];
  const variantClass = ORDER_STATUS_BADGE_CLASS[order.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto w-full"
        style={{ maxWidth: "70%" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6">
            <span className="font-mono text-base">{order.code}</span>
            <Badge variant={variant} className={variantClass ?? undefined}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Thông tin khách hàng</h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ và tên: </span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số điện thoại: </span>
                  <span className="font-medium">
                    {order.customerPhone || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Thông tin đơn hàng</h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Ngày tạo: </span>
                  <span className="font-medium">
                    {formatCreatedAt(order.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cập nhật: </span>
                  <span className="font-medium">
                    {formatCreatedAt(order.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giá ước tính: </span>
                  <span className="font-medium">
                    {order.estimatedPrice != null
                      ? `${VND_FORMATTER.format(order.estimatedPrice)} VND`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.orderNotes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Ghi chú</h3>
              <p className="rounded-lg border bg-amber-50/50 p-4 text-sm whitespace-pre-wrap">
                {order.orderNotes}
              </p>
            </div>
          )}

          {order.attachments && order.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                Tệp đính kèm ({order.attachments.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {order.attachments.map((att, idx) => {
                  const isImage = att.resourceType === "image";
                  const isVideo = att.resourceType === "video";
                  return (
                    <a
                      key={`${att.publicId}-${idx}`}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block overflow-hidden rounded-lg border bg-muted/30 transition-colors hover:border-primary"
                      title={att.originalName ?? att.url}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-background">
                        {isImage ? (
                          <Image
                            src={att.url}
                            alt={att.originalName ?? "attachment"}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : isVideo ? (
                          <video
                            src={att.url}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                          </div>
                        )}

                        <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm">
                          {isImage ? (
                            <ImageIcon className="h-3.5 w-3.5" />
                          ) : isVideo ? (
                            <Film className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="truncate text-xs font-medium text-white">
                            {att.originalName ?? "attachment"}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              <div className="space-y-1 pt-2">
                {order.attachments.map((att, idx) => (
                  <a
                    key={`row-${att.publicId}-${idx}`}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-xs transition-colors hover:bg-muted/40"
                  >
                    {att.resourceType === "image" ? (
                      <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : att.resourceType === "video" ? (
                      <Film className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate font-medium">
                      {att.originalName ?? att.publicId}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatFileSize(att.sizeBytes)}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <ConfigurationDetails config={order.configuration} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface OrderHistoryTableProps {
  orders: OrderResponse[];
  loading?: boolean;
  searching?: boolean;
  error?: string;
  totalPages?: number;
  totalItems?: number;
  onApply: (filters: {
    keyword: string;
    status: OrderStatus | null;
    pageNumber: number;
    pageSize: number;
  }) => void;
  onReset: () => void;
}

export function OrderHistoryTable({
  orders,
  loading = false,
  searching = false,
  error = "",
  totalPages: serverTotalPages,
  totalItems: serverTotalItems,
  onApply,
  onReset,
}: OrderHistoryTableProps) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [previewing, setPreviewing] = useState<OrderResponse | null>(null);

  const isBusy = loading || searching;

  const handleApply = () => {
    setPageNumber(0);
    onApply({
      keyword: keyword.trim(),
      status: statusFilter === "ALL" ? null : statusFilter,
      pageNumber: 0,
      pageSize,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setStatusFilter("ALL");
    setPageNumber(0);
    setPageSize(10);
    onReset();
  };

  const handlePageChange = (next: number) => {
    setPageNumber(next);
    onApply({
      keyword: keyword.trim(),
      status: statusFilter === "ALL" ? null : statusFilter,
      pageNumber: next,
      pageSize,
    });
  };

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPageNumber(0);
    onApply({
      keyword: keyword.trim(),
      status: statusFilter === "ALL" ? null : statusFilter,
      pageNumber: 0,
      pageSize: next,
    });
  };

  const hasFilters = keyword.trim().length > 0 || statusFilter !== "ALL";

  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil(orders.length / pageSize));
  const totalItems = serverTotalItems ?? orders.length;
  const currentPage = Math.min(Math.max(pageNumber, 0), totalPages - 1);

  if (loading && orders.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Đang tải lịch sử đơn hàng…
        </CardContent>
      </Card>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="py-6 text-sm text-destructive">
          Không thể tải lịch sử đơn hàng. {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
          <CardDescription>
            Tìm kiếm theo mã đơn, tên, email, số điện thoại hoặc lọc theo
            trạng thái rồi nhấn &ldquo;Áp dụng&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <label className="text-xs font-medium text-muted-foreground">
                Từ khoá
              </label>
              <Search className="pointer-events-none absolute left-3 top-[70%] h-4 w-4 translate-y-[-50%] text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply();
                }}
                placeholder="Tìm kiếm đơn hàng..."
                className="pl-9"
                disabled={isBusy}
              />
            </div>
            <div className="sm:w-[220px]">
              <label className="text-xs font-medium text-muted-foreground">
                Trạng thái
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as OrderStatus | "ALL")
                }
                disabled={isBusy}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApply} disabled={isBusy}>
                Áp dụng
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isBusy}
              >
                Đặt lại
              </Button>
            </div>
          </div>

          {searching && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Đang tìm kiếm…</p>
            </div>
          )}

          {!searching && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              {hasFilters ? (
                <>
                  <p className="text-sm font-medium">
                    Không có đơn hàng nào khớp với bộ lọc.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Thử điều chỉnh từ khoá hoặc trạng thái rồi nhấn
                    &ldquo;Áp dụng&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    Bạn chưa có đơn hàng nào.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nhấn &ldquo;Đặt dịch vụ mới&rdquo; phía dưới để bắt
                    đầu.
                  </p>
                </>
              )}
            </div>
          )}

          {orders.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Giá ước tính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const variant = ORDER_STATUS_BADGE_VARIANT[order.status];
                    const variantClass =
                      ORDER_STATUS_BADGE_CLASS[order.status];
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => setPreviewing(order)}
                      >
                        <TableCell className="font-mono text-sm">
                          {order.code}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.customerEmail}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCreatedAt(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={variant}
                            className={variantClass ?? undefined}
                          >
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {order.estimatedPrice != null
                            ? `${VND_FORMATTER.format(order.estimatedPrice)}`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {orders.length > 0 && (
            <OrderTablePagination
              pageNumber={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        order={previewing}
        open={previewing !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewing(null);
        }}
      />

      {isBusy && orders.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang cập nhật…
        </div>
      )}
    </div>
  );
}
