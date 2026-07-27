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
  AI_SCENE_PRICE,
  TEXT_2D_3D_PRICE,
  DURATION_EXTEND_PRICE,
  MUSIC_OPTIONS,
  PHOTO_SERVICES,
  PHOTO_ADDON_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  UPLOAD_METHOD_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_SERVICES,
  VIDEO_STYLE_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
  VIRTUAL_STAGING_LEGACY_ROOM_LABELS,
  isVideoServiceSelected,
  isNonVirtualStagingPhotoSelected,
  isVirtualStagingSelected,
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
      return { next: "CONFIRMED", label: "Accept Job" };
    case "REVIEWED":
      return { next: "CONFIRMED", label: "Accept Job" };
    case "CONFIRMED":
      return { next: "IN_PROGRESS", label: "Start Work" };
    case "IN_PROGRESS":
      return { next: "COMPLETED", label: "Complete Order" };
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

function isUrl(v: string): boolean {
  return v.startsWith("http://") || v.startsWith("https://");
}

function linkifyText(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]'"])/g;
  const parts = text.split(urlRegex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith("http://") || part.startsWith("https://")
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">{part}</a>
      : part,
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-primary" />
      <h3 className="text-lg font-bold uppercase tracking-wide text-muted-foreground !text-[#000]">
        {title}
      </h3>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  const display = value || "N/A";
  return (
    <div className={highlight ? "rounded-md border border-amber-200 bg-amber-50/60 p-2" : ""}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {value && isUrl(value) ? (
        <p className="text-sm">
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
            {value}
          </a>
        </p>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{value ? linkifyText(value) : display}</p>
      )}
    </div>
  );
}

function DetailList({ label, values }: { label: string; values: string[] | null | undefined }) {
  if (!values || values.length === 0) return null;
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {values.map((v, i) => (
        <p key={i} className="text-sm">&bull; {v}</p>
      ))}
    </div>
  );
}

function ConfigurationDetails({ config }: { config: unknown }) {
  if (!config || typeof config !== "object") return null;
  const obj = config as Record<string, unknown>;

  const selectedServices = Array.isArray(obj.selectedServices)
    ? (obj.selectedServices as string[])
    : [];
  const serviceLabels = selectedServices.map((id) => SERVICE_LABEL_LOOKUP.get(id) ?? id);
  const hasVideo = isVideoServiceSelected(selectedServices);
  const hasNonVSPhoto = isNonVirtualStagingPhotoSelected(selectedServices);
  const hasVirtualStaging = isVirtualStagingSelected(selectedServices);

  const textCaptionLabels = Array.isArray(obj.textCaptions)
    ? (obj.textCaptions as string[]).map((v) => lookupLabel(TEXT_CAPTIONS_OPTIONS, v) ?? v)
    : [];
  const uploadMethodLabels = Array.isArray(obj.uploadMethods)
    ? (obj.uploadMethods as string[]).map((v) => lookupLabel(UPLOAD_METHOD_OPTIONS, v) ?? v)
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
  const aiSceneCount = Number(obj.aiSceneCount) || 0;
  const text2d3dCount = Number(obj.text2d3dCount) || 0;
  const boundaryDrawOption = !!obj.boundaryDrawOption;
  const confirmRequirements = !!obj.confirmRequirements;
  const confirmExtraCharges = !!obj.confirmExtraCharges;
  const virtualStagingStyle = isFilledString(obj.virtualStagingStyle)
    ? (lookupLabel(VIRTUAL_STAGING_STYLES, obj.virtualStagingStyle) ??
        lookupLabel(
          [
            { value: "contemporary", label: "Contemporary" },
            { value: "farmhouse", label: "Farmhouse" },
            { value: "coastal", label: "Coastal" },
            { value: "custom", label: "Custom based on client request" },
            ...VIRTUAL_STAGING_STYLES,
          ],
          obj.virtualStagingStyle,
        ) ??
        obj.virtualStagingStyle)
    : null;
  const dropboxLink = obj.dropboxLink as string | undefined;
  const googleDriveLink = obj.googleDriveLink as string | undefined;
  const wetransferLink = obj.wetransferLink as string | undefined;

  const configOrderNotes = obj.orderNotes as string | undefined;
  const aiNote = obj.aiNote as string | undefined;
  const aiSceneNote = obj.aiSceneNote as string | undefined;
  const text2d3dNote = obj.text2d3dNote as string | undefined;
  const musicNote = obj.musicNote as string | undefined;
  const textCaptionsNote = obj.textCaptionsNote as string | undefined;
  const transitionsNote = obj.transitionsNote as string | undefined;
  const boundaryDrawNote = obj.boundaryDrawNote as string | undefined;
  const photoServiceNote = obj.photoServiceNote as string | undefined;
  const vsStyleNote = obj.virtualStagingStyleNote as string | undefined;
  const vsRoomsNote = obj.virtualStagingRoomsNote as string | undefined;

  const photoQtyTotal = Number(obj.photoQuantity) || 0;
  const legacyPhotoQty =
    obj.photoQuantities && typeof obj.photoQuantities === "object"
      ? (obj.photoQuantities as Record<string, number>)
      : null;
  const legacyPhotoQtyLine = legacyPhotoQty
    ? Object.entries(legacyPhotoQty)
        .filter(([, n]) => Number(n) > 0)
        .map(([k, n]) => `${k}: ${n}`)
    : [];
  const hasPhotoQty = photoQtyTotal > 0 || legacyPhotoQtyLine.length > 0;

  const photoServiceId = selectedServices.find((id) =>
    PHOTO_SERVICES.some((s) => s.id === id),
  );
  const photoServiceObj = PHOTO_SERVICES.find((s) => s.id === photoServiceId);
  const unitPrice = photoServiceObj?.price ?? 0;

  const photoAddOns =
    obj.photoAddOns && typeof obj.photoAddOns === "object"
      ? (obj.photoAddOns as Record<string, unknown>)
      : null;
  const addonLines: string[] = [];
  const addonNotes: { label: string; note: string }[] = [];
  if (photoAddOns) {
    for (const opt of PHOTO_ADDON_OPTIONS) {
      if (photoAddOns[opt.key]) {
        const isGrass = opt.key === "grassReplacement";
        const grassCount = Number(photoAddOns.grassReplacementCount || 0);
        const priceSuffix = isGrass
          ? ` (${grassCount} photos, +$${grassCount * 1.0})`
          : opt.price
          ? ` (+$${opt.price}/photo)`
          : "";
        addonLines.push(`${opt.label}${priceSuffix}`);
        const note = photoAddOns[opt.noteKey];
        if (isFilledString(note)) {
          addonNotes.push({ label: `${opt.label} note`, note: String(note) });
        }
      }
    }
  }

  const roomCounts =
    obj.virtualStagingRoomCounts &&
    typeof obj.virtualStagingRoomCounts === "object" &&
    !Array.isArray(obj.virtualStagingRoomCounts)
      ? (obj.virtualStagingRoomCounts as Record<string, number>)
      : null;
  const roomCountLines = roomCounts
    ? Object.entries(roomCounts)
        .filter(([, n]) => Number(n) > 0)
        .map(([k, n]) => {
          const label =
            lookupLabel(VIRTUAL_STAGING_ROOMS, k) ??
            VIRTUAL_STAGING_LEGACY_ROOM_LABELS[k] ??
            k;
          return `${label} — ${n} photos`;
        })
    : [];

  const legacyRoomLabels = Array.isArray(obj.virtualStagingRooms)
    ? (obj.virtualStagingRooms as string[]).map((v) => {
        const label =
          lookupLabel(VIRTUAL_STAGING_ROOMS, v) ??
          VIRTUAL_STAGING_LEGACY_ROOM_LABELS[v] ??
          v;
        return `${label} (legacy) · 1 photo`;
      })
    : [];

  const roomNotes =
    obj.virtualStagingRoomNotes &&
    typeof obj.virtualStagingRoomNotes === "object"
      ? (obj.virtualStagingRoomNotes as Record<string, string>)
      : null;
  const roomNoteEntries: { roomLabel: string; note: string }[] = [];
  if (roomNotes) {
    for (const [k, v] of Object.entries(roomNotes)) {
      if (isFilledString(v)) {
        const label =
          lookupLabel(VIRTUAL_STAGING_ROOMS, k) ??
          VIRTUAL_STAGING_LEGACY_ROOM_LABELS[k] ??
          k;
        roomNoteEntries.push({ roomLabel: label, note: String(v) });
      }
    }
  }

  const hasAddons = addonLines.length > 0;
  const hasVS =
    !!virtualStagingStyle ||
    roomCountLines.length > 0 ||
    legacyRoomLabels.length > 0 ||
    isFilledString(vsStyleNote) ||
    isFilledString(vsRoomsNote) ||
    roomNoteEntries.length > 0;

  const hasUpload =
    uploadMethodLabels.length > 0 || dropboxLink || googleDriveLink || wetransferLink;
  const hasAnyCustomer = customerName || customerEmail || realEstateAddress || instagramHandle || websiteUrl;

  const vsPrice = PHOTO_SERVICES.find((s) => s.id === "virtual-staging")?.price ?? 0;
  const vsTotal = roomCountLines.length > 0
    ? roomCountLines.reduce((sum, line) => {
        const match = line.match(/— (\d+) photos/);
        return sum + (match ? parseInt(match[1], 10) : 0);
      }, 0)
    : legacyRoomLabels.length;

  /* ---- price calculation helpers ---- */

  const customDurationPrice = (() => {
    if (videoDuration !== "Custom" && videoDuration !== "custom") return null;
    const secs = parseInt(customVideoDuration ?? "", 10);
    if (!Number.isFinite(secs) || secs < 1) return null;
    if (secs < 60) return { secs, extra: 0, cost: 0, free: true };
    const extra = Math.floor((secs - 60) / 15);
    return { secs, extra, cost: extra * DURATION_EXTEND_PRICE, free: false };
  })();

  const durationPriceLine = (videoDurationExtended ?? 0) > 0
    ? `60s + ${(videoDurationExtended ?? 0) * 15}s = ${60 + (videoDurationExtended ?? 0) * 15}s (+ $${(videoDurationExtended ?? 0) * DURATION_EXTEND_PRICE})`
    : null;

  const aiScenePriceLine = aiSceneCount > 0
    ? `${aiSceneCount} × $${AI_SCENE_PRICE} = $${aiSceneCount * AI_SCENE_PRICE}`
    : null;
  const text2d3dPriceLine = text2d3dCount > 0
    ? `${text2d3dCount} × $${TEXT_2D_3D_PRICE} = $${text2d3dCount * TEXT_2D_3D_PRICE}`
    : null;

  const aspectPriceLine = aspectRatios === "Both" || aspectRatios === "both"
    ? `${aspectRatios} +$15`
    : aspectRatios;

  return (
    <div className="space-y-5">
      {/* ====== 1. Customer & Property ====== */}
      {hasAnyCustomer && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Customer & Property" />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Full Name" value={customerName} />
            <DetailRow label="Paypal Email" value={customerEmail} />
            <DetailRow label="Real Estate Address" value={realEstateAddress} />
            <DetailRow label="Instagram" value={instagramHandle} />
            <DetailRow label="Website" value={websiteUrl} />
          </div>
        </section>
      )}

      {/* ====== 2. Photo Quantities (non-VS photo) ====== */}
      {hasNonVSPhoto && hasPhotoQty && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Photo Quantities" />
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">
                {photoServiceObj?.label ?? "Photo"} Quantity
              </span>
              <p className="text-sm font-medium">{photoQtyTotal} photos</p>
              {unitPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  {photoQtyTotal} × {formatCurrency(unitPrice)} = {formatCurrency(photoQtyTotal * unitPrice)}
                </p>
              )}
            </div>
            {legacyPhotoQtyLine.length > 0 && (
              <DetailList label="Legacy Quantities" values={legacyPhotoQtyLine} />
            )}
            {hasAddons ? (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Replacement Add-ons</span>
                <div className="space-y-2">
                  {addonLines.map((line, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm">{line}</p>
                    </div>
                  ))}
                  {addonNotes.map((n, i) => (
                    <p key={i} className="text-xs text-muted-foreground pl-1">{n.label}: {linkifyText(n.note)}</p>
                  ))}
                </div>
              </div>
            ) : (
              <DetailRow label="Photo service notes" value={photoServiceNote} />
            )}
          </div>
        </section>
      )}

      {/* ====== 3. Video Editing Options ====== */}
      {hasVideo && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Video Editing Options" />
          <div className="grid gap-4 md:grid-cols-2">
            {/* Video Duration */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Video Duration</span>
              <p className="text-sm">{videoDuration ?? "N/A"}</p>
              {videoDuration === "Custom" && customDurationPrice && (
                <p className="text-xs text-muted-foreground">
                  {customDurationPrice.secs}s
                  {customDurationPrice.free
                    ? " · Free (under 60s)"
                    : ` · First 60s free · ${customDurationPrice.extra} × 15s = +$${customDurationPrice.cost}`}
                </p>
              )}
              {(videoDurationExtended ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Extended Duration: {durationPriceLine ?? `${videoDurationExtended} × 15s`}
                </p>
              )}
            </div>

            {/* Video Style */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Video Editing Style</span>
              <p className="text-sm">{videoStyle ?? "N/A"}</p>
            </div>

            {/* Aspect Ratio */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Aspect Ratio</span>
              <p className="text-sm">{aspectPriceLine ?? "N/A"}</p>
            </div>

            {/* Background Music */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Background Music</span>
              <p className="text-sm">{music ?? "N/A"}</p>
              {musicNote && <p className="text-xs text-muted-foreground">{linkifyText(musicNote)}</p>}
              {music === "I will provide" && (
                <p className="text-xs text-muted-foreground">Music file: N/A (not stored in config)</p>
              )}
            </div>

            {/* Text & Captions */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Text & Captions</span>
              {textCaptionLabels.length > 0 ? (
                <div className="space-y-0.5">
                  {textCaptionLabels.map((label, i) => (
                    <p key={i} className="text-sm">&bull; {label}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
              )}
              {textCaptionsNote && <p className="text-xs text-muted-foreground">{linkifyText(textCaptionsNote)}</p>}
            </div>

            {/* Transitions */}
            <div className="rounded-lg border p-4 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Transitions</span>
              <p className="text-sm">{transitions ?? "N/A"}</p>
              {transitionsNote && <p className="text-xs text-muted-foreground">{linkifyText(transitionsNote)}</p>}
            </div>
          </div>

          {/* Additional Options */}
          <div className="rounded-lg border p-4 space-y-3">
            <span className="text-xs font-medium text-muted-foreground">Additional Options</span>
            <div className="space-y-2">
              <p className="text-sm">
                AI Voiceover: {aiOption ? "Yes (+$20)" : "N/A"}
              </p>
              {aiNote && <p className="text-xs text-muted-foreground pl-3">{linkifyText(aiNote)}</p>}
              {aiSceneCount > 0 && (
                <div>
                  <p className="text-sm">AI Scenes: {aiScenePriceLine}</p>
                  {aiSceneNote && <p className="text-xs text-muted-foreground pl-3">{linkifyText(aiSceneNote)}</p>}
                </div>
              )}
              {text2d3dCount > 0 && (
                <div>
                  <p className="text-sm">Transfer Text 2D/3D: {text2d3dPriceLine}</p>
                  {text2d3dNote && <p className="text-xs text-muted-foreground pl-3">{linkifyText(text2d3dNote)}</p>}
                </div>
              )}
              <p className="text-sm">
                Boundary Draw: {boundaryDrawOption ? "Yes (+$10)" : "N/A"}
              </p>
              {boundaryDrawNote && <p className="text-xs text-muted-foreground pl-3">{linkifyText(boundaryDrawNote)}</p>}
            </div>
          </div>
        </section>
      )}

      {/* ====== 4. Virtual Staging ====== */}
      {hasVirtualStaging && hasVS && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Virtual Staging" />
          <div className="space-y-3">
            <DetailRow label="Style" value={virtualStagingStyle} />
            <DetailRow label="Style notes" value={vsStyleNote} highlight />
            <DetailList
              label="Rooms"
              values={roomCountLines.length > 0 ? roomCountLines : legacyRoomLabels}
            />
            {vsTotal > 0 && (
              <p className="text-sm font-medium">
                Total staged photos: {vsTotal} · {formatCurrency(vsPrice)}/photo = {formatCurrency(vsTotal * vsPrice)}
              </p>
            )}
            {roomNoteEntries.map((r) => (
              <DetailRow key={r.roomLabel} label={`${r.roomLabel} note`} value={r.note} highlight />
            ))}
            <DetailRow label="Room notes" value={vsRoomsNote} highlight />
          </div>
        </section>
      )}

      {/* ====== 5. Upload Methods ====== */}
      {hasUpload && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Upload Files" />
          <div className="space-y-3">
            <DetailList label="Upload Method" values={uploadMethodLabels} />
            <DetailRow label="Dropbox Link" value={dropboxLink} />
            <DetailRow label="Google Drive Link" value={googleDriveLink} />
            <DetailRow label="WeTransfer Link" value={wetransferLink} />
          </div>
        </section>
      )}

      {/* ====== 6. Order Notes ====== */}
      {configOrderNotes && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Order Notes" />
          <p className="text-sm whitespace-pre-wrap">{linkifyText(configOrderNotes)}</p>
        </section>
      )}

      {/* ====== 7. Confirmation ====== */}
      {(confirmRequirements || confirmExtraCharges) && (
        <section className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
          <SectionHeading title="Confirm Revision Policy" />
          <div className="space-y-1">
            {confirmRequirements && <p className="text-sm">&bull; Requirements confirmed: Yes</p>}
            {confirmExtraCharges && <p className="text-sm">&bull; Extra charges confirmed: Yes</p>}
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
                {linkifyText(order.orderNotes)}
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

          {order.customerRevisionNote && (
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-700">Revision Request</h3>
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm whitespace-pre-wrap text-amber-800">
                {linkifyText(order.customerRevisionNote)}
              </p>
            </div>
          )}

          {order.linkDone && (
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-700">Link Done</h3>
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm break-all">
                <a href={order.linkDone} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-800">
                  {order.linkDone}
                </a>
              </p>
            </div>
          )}

          {order.doneNote && (
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-700">Done Note</h3>
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm whitespace-pre-wrap text-emerald-800">
                {linkifyText(order.doneNote)}
              </p>
            </div>
          )}

          {order.orderHistory && order.orderHistory.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Order History</h3>
              <div className="space-y-2">
                {order.orderHistory.map((event, idx) => (
                  <div key={idx} className="rounded-lg border p-3 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {event.type === "COMPLETED" ? "Completed" : "Revision Requested"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString("en-US")} &middot; {event.updatedBy}
                      </span>
                    </div>
                    {event.linkDone && (
                      <div>
                        <span className="text-xs text-muted-foreground">Link: </span>
                        <a href={event.linkDone} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          {event.linkDone}
                        </a>
                      </div>
                    )}
                    {event.doneNote && (
                      <p className="text-xs text-muted-foreground">{linkifyText(event.doneNote)}</p>
                    )}
                    {event.note && (
                      <p className="text-xs text-amber-700">{linkifyText(event.note)}</p>
                    )}
                  </div>
                ))}
              </div>
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
    linkDone?: string,
    doneNote?: string,
  ) => void | Promise<void>;
  onRequestRevision?: (orderId: number, revisionNote: string) => void | Promise<void>;
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
  onRequestRevision,
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
  const [completeDialog, setCompleteDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({ open: false, orderId: null });
  const [completeLinkDone, setCompleteLinkDone] = useState("");
  const [completeDoneNote, setCompleteDoneNote] = useState("");
  const [revisionDialog, setRevisionDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({ open: false, orderId: null });
  const [revisionNote, setRevisionNote] = useState("");

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
                    {!isManager && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
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
                        {!isManager && (
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap justify-end gap-1">
                              {order.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isBusy}
                                  className="h-8 border-red-500 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setRejectDialog({
                                      open: true,
                                      orderId: order.id,
                                      status: "CANCELLED",
                                    });
                                    setRejectNote("");
                                  }}
                                >
                                  Cancel Order
                                </Button>
                              )}
                              {order.status === "COMPLETED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isBusy}
                                  className="h-8 border-amber-500 text-amber-700 hover:bg-amber-50"
                                  onClick={() => {
                                    setRevisionDialog({ open: true, orderId: order.id });
                                    setRevisionNote("");
                                  }}
                                >
                                  Request Revision
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
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
                                  onClick={() => {
                                    if (primary.next === "COMPLETED") {
                                      setCompleteDialog({ open: true, orderId: order.id });
                                      setCompleteLinkDone("");
                                      setCompleteDoneNote("");
                                    } else {
                                      onStatusChange?.(order.id, primary.next);
                                    }
                                  }}
                                >
                                  {primary.label}
                                </Button>
                              )}
                              {canTerminal && (
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
                                  Refuse
                                </Button>
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

      <Dialog
        open={completeDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteDialog({ open: false, orderId: null });
            setCompleteLinkDone("");
            setCompleteDoneNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="linkDone" className="text-sm font-medium">
                Link Done (URL)
              </label>
              <Input
                id="linkDone"
                placeholder="e.g. https://drive.google.com/..."
                value={completeLinkDone}
                onChange={(e) => setCompleteLinkDone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="doneNote" className="text-sm font-medium">
                Done Note
              </label>
              <Textarea
                id="doneNote"
                placeholder="Note for customer..."
                value={completeDoneNote}
                onChange={(e) => setCompleteDoneNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCompleteDialog({ open: false, orderId: null });
                setCompleteLinkDone("");
                setCompleteDoneNote("");
              }}
            >
              Close
            </Button>
            <Button
              disabled={actionLoading || completeDialog.orderId == null}
              onClick={async () => {
                if (completeDialog.orderId == null) return;
                await onStatusChange?.(
                  completeDialog.orderId,
                  "COMPLETED",
                  undefined,
                  completeLinkDone.trim() || undefined,
                  completeDoneNote.trim() || undefined,
                );
                setCompleteDialog({ open: false, orderId: null });
                setCompleteLinkDone("");
                setCompleteDoneNote("");
              }}
            >
              Confirm Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={revisionDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRevisionDialog({ open: false, orderId: null });
            setRevisionNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe what changes you would like made to the delivered work.
            </p>
            <Textarea
              placeholder="Describe the changes you need..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRevisionDialog({ open: false, orderId: null });
                setRevisionNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={actionLoading || revisionDialog.orderId == null || !revisionNote.trim()}
              onClick={async () => {
                if (revisionDialog.orderId == null) return;
                await onRequestRevision?.(
                  revisionDialog.orderId,
                  revisionNote.trim(),
                );
                setRevisionDialog({ open: false, orderId: null });
                setRevisionNote("");
              }}
            >
              Submit Revision Request
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
