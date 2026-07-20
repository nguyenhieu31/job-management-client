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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  MUSIC_OPTIONS,
  PHOTO_SERVICES,
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
import { formatCurrency } from "@/lib/utils";

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
          Items per page:
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
        Showing {startItem}-{endItem} of {totalItems} items
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
          className="h-8 w-8"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!canGoPrevious}
          className="h-8 w-8"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm tabular-nums">
          Page {pageNumber + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!canGoNext}
          className="h-8 w-8"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(totalPages - 1, 0))}
          disabled={!canGoNext}
          className="h-8 w-8"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
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

const VND_FORMATTER = new Intl.NumberFormat("en-US");

const STATUS_FILTER_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  ...(
    Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]
  ).map(([value, label]) => ({ value, label })),
];

/** Primary forward action for manager multi-step pipeline */
export function getPrimaryOrderAction(
  status: OrderStatus,
): { next: OrderStatus; label: string } | null {
  switch (status) {
    case "PENDING":
      return { next: "REVIEWED", label: "Review" };
    case "REVIEWED":
      return { next: "CONFIRMED", label: "Confirm" };
    case "CONFIRMED":
      return { next: "IN_PROGRESS", label: "Accept" };
    case "IN_PROGRESS":
      return { next: "COMPLETED", label: "Complete" };
    default:
      return null;
  }
}

export function canTerminalOrderAction(status: OrderStatus): boolean {
  return (
    status === "PENDING" ||
    status === "REVIEWED" ||
    status === "CONFIRMED"
  );
}

function formatCreatedAt(createdAt: string): string {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return createdAt;
  return parsed.toLocaleString("en-US");
}

function formatFileSize(sizeBytes?: number): string {
  if (sizeBytes == null || Number.isNaN(sizeBytes)) return "\u2014";
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

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {children}
      </div>
    </section>
  );
}

function ConfigRow({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className={highlight ? "col-span-full rounded-md border border-amber-200 bg-amber-50/60 p-2" : ""}>
      <ConfigLabel label={label} />
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function ConfigListRow({ label, values, highlight }: { label: string; values: string[] | null | undefined; highlight?: boolean }) {
  if (!values || values.length === 0) return null;
  return (
    <div className={highlight ? "col-span-full rounded-md border border-amber-200 bg-amber-50/60 p-2" : ""}>
      <ConfigLabel label={label} />
      <ul className="mt-0.5 list-inside list-disc text-sm">
        {values.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ConfigLabel({ label }: { label: string }) {
  return <span className="text-xs font-medium text-muted-foreground">{label}</span>;
}

function ConfigurationDetails({ config }: { config: unknown }) {
  if (!config || typeof config !== "object") return null;
  const obj = config as Record<string, unknown>;

  const serviceLabels = Array.isArray(obj.selectedServices)
    ? (obj.selectedServices as string[]).map((id) => SERVICE_LABEL_LOOKUP.get(id) ?? id)
    : [];
  const textCaptionLabels = Array.isArray(obj.textCaptions)
    ? (obj.textCaptions as string[]).map((v) => lookupLabel(TEXT_CAPTIONS_OPTIONS, v) ?? v)
    : [];
  const uploadMethodLabels = Array.isArray(obj.uploadMethods)
    ? (obj.uploadMethods as string[]).map((v) => lookupLabel(UPLOAD_METHOD_OPTIONS, v) ?? v)
    : [];
  const virtualStagingRoomLabels = Array.isArray(obj.virtualStagingRooms)
    ? (obj.virtualStagingRooms as string[]).map((v) => lookupLabel(VIRTUAL_STAGING_ROOMS, v) ?? v)
    : [];

  const customerName = obj.customerName as string | undefined;
  const customerEmail = obj.customerEmail as string | undefined;
  const realEstateAddress = obj.realEstateAddress as string | undefined;
  const instagramHandle = obj.instagramHandle as string | undefined;
  const websiteUrl = obj.websiteUrl as string | undefined;
  const videoDuration = isFilledString(obj.videoDuration)
    ? (lookupLabel(VIDEO_DURATION_OPTIONS, obj.videoDuration) ?? obj.videoDuration)
    : null;
  const customVideoDuration = obj.customVideoDuration as string | undefined;
  const videoDurationExtended = obj.videoDurationExtended != null ? Number(obj.videoDurationExtended) : undefined;
  const videoStyle = isFilledString(obj.videoStyle)
    ? (lookupLabel(VIDEO_STYLE_OPTIONS, obj.videoStyle) ?? obj.videoStyle)
    : null;
  const aspectRatios = isFilledString(obj.aspectRatios as string)
    ? (lookupLabel(ASPECT_RATIO_OPTIONS, obj.aspectRatios as string) ?? obj.aspectRatios as string)
    : null;
  const music = isFilledString(obj.music)
    ? (lookupLabel(MUSIC_OPTIONS, obj.music) ?? obj.music)
    : null;
  const transitions = isFilledString(obj.transitions)
    ? (lookupLabel(TRANSITIONS_OPTIONS, obj.transitions) ?? obj.transitions)
    : null;
  const aiOption = !!obj.aiOption;
  const boundaryDrawOption = !!obj.boundaryDrawOption;
  const confirmRequirements = !!obj.confirmRequirements;
  const confirmExtraCharges = !!obj.confirmExtraCharges;
  const virtualStagingStyle = isFilledString(obj.virtualStagingStyle)
    ? (lookupLabel(VIRTUAL_STAGING_STYLES, obj.virtualStagingStyle) ?? obj.virtualStagingStyle)
    : null;
  const dropboxLink = obj.dropboxLink as string | undefined;
  const googleDriveLink = obj.googleDriveLink as string | undefined;
  const wetransferLink = obj.wetransferLink as string | undefined;

  // Note fields
  const configOrderNotes = obj.orderNotes as string | undefined;
  const aiNote = obj.aiNote as string | undefined;
  const musicNote = obj.musicNote as string | undefined;
  const textCaptionsNote = obj.textCaptionsNote as string | undefined;
  const transitionsNote = obj.transitionsNote as string | undefined;
  const boundaryDrawNote = obj.boundaryDrawNote as string | undefined;

  const hasNotes = configOrderNotes || aiNote || musicNote || textCaptionsNote || transitionsNote || boundaryDrawNote;
  const hasVirtualStaging = virtualStagingRoomLabels.length > 0 || !!virtualStagingStyle;
  const hasUpload = uploadMethodLabels.length > 0 || dropboxLink || googleDriveLink || wetransferLink;

  return (
    <div className="space-y-5">
      {/* Customer & Property */}
      {(customerName || customerEmail || realEstateAddress || instagramHandle || websiteUrl) && (
        <ConfigSection title="Customer & Property">
          <ConfigRow label="Customer Name" value={customerName} />
          <ConfigRow label="Customer Email" value={customerEmail} />
          <ConfigRow label="Real Estate Address" value={realEstateAddress} />
          <ConfigRow label="Instagram" value={instagramHandle} />
          <ConfigRow label="Website URL" value={websiteUrl} />
        </ConfigSection>
      )}

      {/* Services & Video Config */}
      {(serviceLabels.length > 0 || videoDuration || videoStyle || aspectRatios || music || textCaptionLabels.length > 0 || transitions || customVideoDuration || (videoDurationExtended != null && videoDurationExtended > 0)) && (
        <ConfigSection title="Services & Configuration">
          <ConfigListRow label="Selected Services" values={serviceLabels} />
          <ConfigRow label="Video Duration" value={videoDuration} />
          {videoDuration === "Custom" || videoDuration === "custom" ? (
            <ConfigRow label="Custom Duration" value={customVideoDuration ? `${customVideoDuration}s` : undefined} />
          ) : null}
          {videoDurationExtended != null && videoDurationExtended > 0 ? (
            <ConfigRow label="Extended Duration" value={`+${videoDurationExtended} × 15s`} />
          ) : null}
          <ConfigRow label="Editing Style" value={videoStyle} />
          <ConfigRow label="Aspect Ratio" value={aspectRatios} />
          <ConfigRow label="Background Music" value={music} />
          <ConfigListRow label="Text & Captions" values={textCaptionLabels} />
          <ConfigRow label="Transitions" value={transitions} />
          {aiOption && <ConfigRow label="AI Voiceover (+$20)" value="Yes" />}
          {boundaryDrawOption && <ConfigRow label="Boundary Draw (+$10)" value="Yes" />}
          {confirmRequirements && <ConfigRow label="Requirements Confirmed" value="Yes" />}
          {confirmExtraCharges && <ConfigRow label="Extra Charges Confirmed" value="Yes" />}
        </ConfigSection>
      )}

      {/* Virtual Staging */}
      {hasVirtualStaging && (
        <ConfigSection title="Virtual Staging">
          <ConfigListRow label="Room Type" values={virtualStagingRoomLabels} />
          <ConfigRow label="Style" value={virtualStagingStyle} />
        </ConfigSection>
      )}

      {/* Upload Methods */}
      {hasUpload && (
        <ConfigSection title="Upload Methods">
          <ConfigListRow label="Upload Method" values={uploadMethodLabels} />
          <ConfigRow label="Dropbox Link" value={dropboxLink} />
          <ConfigRow label="Google Drive Link" value={googleDriveLink} />
          <ConfigRow label="WeTransfer Link" value={wetransferLink} />
        </ConfigSection>
      )}

      {/* Notes - highlighted */}
      {hasNotes && (
        <ConfigSection title="Notes & Instructions">
          <ConfigRow label="Order Notes" value={configOrderNotes} highlight />
          <ConfigRow label="AI Voiceover Note" value={aiNote} highlight />
          <ConfigRow label="Music Note" value={musicNote} highlight />
          <ConfigRow label="Text Captions Note" value={textCaptionsNote} highlight />
          <ConfigRow label="Transitions Note" value={transitionsNote} highlight />
          <ConfigRow label="Boundary Draw Note" value={boundaryDrawNote} highlight />
        </ConfigSection>
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
              <h3 className="font-semibold">Customer Information</h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name: </span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium">
                    {order.customerPhone || "\u2014"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Order Information</h3>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  <span className="font-medium">
                    {formatCreatedAt(order.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated: </span>
                  <span className="font-medium">
                    {formatCreatedAt(order.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Price: </span>
                  <span className="font-medium">
                    {order.estimatedPrice != null
                      ? formatCurrency(order.estimatedPrice)
                      : "\u2014"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.orderNotes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="rounded-lg border bg-amber-50/50 p-4 text-sm whitespace-pre-wrap">
                {order.orderNotes}
              </p>
            </div>
          )}

          {order.managerRejectNote && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700">Rejection Reason (System)</h3>
              <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm whitespace-pre-wrap text-red-800">
                {order.managerRejectNote}
              </p>
            </div>
          )}

          {order.customerRejectNote && (
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700">Rejection Reason (Customer)</h3>
              <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm whitespace-pre-wrap text-red-800">
                {order.customerRejectNote}
              </p>
            </div>
          )}

          {order.attachments && order.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                Attachments ({order.attachments.length})
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
  mode?: "customer" | "manager";
  actionLoading?: boolean;
  onStatusChange?: (
    orderId: number,
    status: OrderStatus,
    rejectNote?: string,
  ) => void | Promise<void>;
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
  mode = "customer",
  actionLoading = false,
  onStatusChange,
  onApply,
  onReset,
}: OrderHistoryTableProps) {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [previewing, setPreviewing] = useState<OrderResponse | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    orderId: number | null;
    status: OrderStatus | null;
  }>({ open: false, orderId: null, status: null });
  const [rejectNote, setRejectNote] = useState("");

  const isBusy = loading || searching || actionLoading;
  const isManager = mode === "manager";

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
          Loading order history\u2026
        </CardContent>
      </Card>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="py-6 text-sm text-destructive">
          Could not load order history. {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isManager ? "Order Management" : "Order History"}
          </CardTitle>
          <CardDescription>
            Search by order code, name, email, phone or filter by status,
            then click &ldquo;Apply&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative flex-1">
              <label className="text-xs font-medium text-muted-foreground">
                Keyword
              </label>
              <Search className="pointer-events-none absolute left-3 top-[70%] h-4 w-4 translate-y-[-50%] text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApply();
                }}
                placeholder="Search orders..."
                className="pl-9"
                disabled={isBusy}
              />
            </div>
            <div className="sm:w-[220px]">
              <label className="text-xs font-medium text-muted-foreground">
                Status
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
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isBusy}
              >
                Reset
              </Button>
            </div>
          </div>

          {searching && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Searching\u2026</p>
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
                    No orders match your filters.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your keyword or status then click
                    &ldquo;Apply&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    {isManager
                      ? "No orders yet."
                      : "You have no orders yet."}
                  </p>
                  {!isManager && (
                    <p className="text-xs text-muted-foreground">
                      Click &ldquo;Book New Service&rdquo; below to get started.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {orders.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Est. Price</TableHead>
                    {isManager && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const variant = ORDER_STATUS_BADGE_VARIANT[order.status];
                    const variantClass =
                      ORDER_STATUS_BADGE_CLASS[order.status];
                    const primary = getPrimaryOrderAction(order.status);
                    const canTerminal = canTerminalOrderAction(order.status);
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
                            : "\u2014"}
                        </TableCell>
                        {isManager && (
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap justify-end gap-1">
                              {primary && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={actionLoading}
                                  className="h-8 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                                  onClick={() =>
                                    onStatusChange?.(order.id, primary.next)
                                  }
                                >
                                  {primary.label}
                                </Button>
                              )}
                              {canTerminal && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actionLoading}
                                    className="h-8 border-orange-500 text-orange-700 hover:bg-orange-50"
                                    onClick={() => {
                                      setRejectDialog({
                                        open: true,
                                        orderId: order.id,
                                        status: "CANCELLED",
                                      });
                                      setRejectNote("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actionLoading}
                                    className="h-8 border-red-500 text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setRejectDialog({
                                        open: true,
                                        orderId: order.id,
                                        status: "REJECTED",
                                      });
                                      setRejectNote("");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        )}
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

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog({ open: false, orderId: null, status: null });
            setRejectNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectDialog.status === "CANCELLED"
                ? "Cancel Order"
                : "Reject Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason (optional)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, orderId: null, status: null });
                setRejectNote("");
              }}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading || rejectDialog.orderId == null}
              onClick={async () => {
                if (rejectDialog.orderId == null || !rejectDialog.status) return;
                await onStatusChange?.(
                  rejectDialog.orderId,
                  rejectDialog.status,
                  rejectNote.trim() || undefined,
                );
                setRejectDialog({ open: false, orderId: null, status: null });
                setRejectNote("");
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isBusy && orders.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating\u2026
        </div>
      )}
    </div>
  );
}
