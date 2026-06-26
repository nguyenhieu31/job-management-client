"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";
import {
  type AddServiceFormState,
  PHOTO_SERVICES,
  VIDEO_SERVICES,
  VIDEO_SERVICE_IDS,
  isVideoServiceSelected,
} from "@/types/services";

interface SummaryCardProps {
  state: AddServiceFormState;
  mobile?: boolean;
}

function getServiceLabel(id: string): string {
  const photo = PHOTO_SERVICES.find((s) => s.id === id);
  if (photo) return photo.label;
  const video = VIDEO_SERVICES.find((s) => s.id === id);
  if (video) return video.label;
  return id;
}

function getOptionLabel(
  value: string,
  options: { value: string; label: string }[],
): string {
  const found = options.find((o) => o.value === value);
  return found ? found.label : value;
}

export function SummaryCard({ state, mobile = false }: SummaryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasVideo = isVideoServiceSelected(state.selectedServices);

  const content = (
    <div className="space-y-4">
      {/* Customer */}
      {state.customerName && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Khách hàng
          </p>
          <p className="text-sm mt-0.5">{state.customerName}</p>
          {state.customerEmail && (
            <p className="text-xs text-muted-foreground">
              {state.customerEmail}
            </p>
          )}
        </div>
      )}

      {/* Selected Services */}
      {state.selectedServices.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dịch vụ đã chọn ({state.selectedServices.length})
          </p>
          <ul className="mt-1 space-y-0.5">
            {state.selectedServices.map((id) => (
              <li key={id} className="text-sm">
                {getServiceLabel(id)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Turnaround */}
      {state.turnaround && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Thời gian hoàn thành
          </p>
          <p className="text-sm mt-0.5">
            {getOptionLabel(state.turnaround, [
              { value: "6h", label: "6 giờ" },
              { value: "12h", label: "12 giờ" },
              { value: "24h", label: "24 giờ" },
              { value: "48h", label: "48 giờ" },
              { value: "custom", label: "Tùy chỉnh" },
            ])}
          </p>
        </div>
      )}

      {/* Video options */}
      {hasVideo && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Video Options
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {state.videoStyle && (
              <li>
                Style:{" "}
                {getOptionLabel(state.videoStyle, [
                  { value: "clean-simple", label: "Clean & Simple" },
                  { value: "luxury-cinematic", label: "Luxury & Cinematic" },
                  {
                    value: "fast-paced-social",
                    label: "Fast-paced Social Media",
                  },
                  {
                    value: "advertising-marketing",
                    label: "Advertising / Marketing",
                  },
                  {
                    value: "editor-decides",
                    label: "Để editor tự quyết định",
                  },
                ])}
              </li>
            )}
            {state.aspectRatios.length > 0 && (
              <li>Aspect: {state.aspectRatios.join(", ")}</li>
            )}
            {state.music && (
              <li>
                Music:{" "}
                {getOptionLabel(state.music, [
                  { value: "i-will-provide", label: "Tôi cung cấp nhạc" },
                  { value: "editor-chooses", label: "Editor chọn nhạc" },
                  { value: "no-music", label: "Không nhạc" },
                ])}
              </li>
            )}
            {state.transitions && (
              <li>Transitions: {state.transitions}</li>
            )}
            {state.creativeFreedom && (
              <li>Creative freedom: {state.creativeFreedom}</li>
            )}
          </ul>
        </div>
      )}

      {/* Upload methods */}
      {state.uploadMethods.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Upload method
          </p>
          <p className="text-sm mt-0.5">
            {state.uploadMethods
              .map((m) =>
                getOptionLabel(m, [
                  { value: "dropbox", label: "Dropbox" },
                  { value: "google-drive", label: "Google Drive" },
                  { value: "wetransfer", label: "WeTransfer" },
                  { value: "direct-upload", label: "Direct upload" },
                ]),
              )
              .join(", ")}
          </p>
        </div>
      )}

      {state.selectedServices.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <Package className="h-8 w-8" />
          <p className="text-sm">Chưa chọn dịch vụ</p>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div className="rounded-lg border bg-card">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-3 text-left"
        >
          <span className="text-sm font-medium">Tóm tắt đơn hàng</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="border-t p-3">{content}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card p-4")}>
      <p className="text-sm font-semibold mb-3">Tóm tắt đơn hàng</p>
      {content}
    </div>
  );
}
