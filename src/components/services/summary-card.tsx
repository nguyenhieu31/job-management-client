"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";
import {
  type AddServiceFormState,
  PHOTO_SERVICES,
  VIDEO_SERVICES,
  VIDEO_SERVICE_IDS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  MUSIC_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  isVideoServiceSelected,
  computeEstimatedPrice,
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

function getServicePrice(id: string): number | undefined {
  const photo = PHOTO_SERVICES.find((s) => s.id === id);
  if (photo?.price) return photo.price;
  const video = VIDEO_SERVICES.find((s) => s.id === id);
  return video?.price;
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
  const estimatedPrice = computeEstimatedPrice(state);

  const content = (
    <div className="space-y-4">
      {/* Customer */}
      {state.customerName && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Customer
          </p>
          <p className="text-sm mt-0.5">{state.customerName}</p>
          {state.customerEmail && (
            <p className="text-xs text-muted-foreground">
              {state.customerEmail}
            </p>
          )}
          {state.realEstateAddress && (
            <p className="text-xs text-muted-foreground">
              Address: {state.realEstateAddress}
            </p>
          )}
          {state.instagramHandle && (
            <p className="text-xs text-muted-foreground">
              Instagram: {state.instagramHandle}
            </p>
          )}
          {state.websiteUrl && (
            <p className="text-xs text-muted-foreground">
              Website: {state.websiteUrl}
            </p>
          )}
        </div>
      )}

      {/* Selected Services */}
      {state.selectedServices.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Services ({state.selectedServices.length})
          </p>
          <ul className="mt-1 space-y-0.5">
            {state.selectedServices.map((id) => {
              const price = getServicePrice(id);
              return (
                <li key={id} className="flex items-center justify-between text-sm">
                  <span>{getServiceLabel(id)}</span>
                  {price != null && (
                    <span className="text-xs text-muted-foreground">
                      +{formatCurrency(price)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Video options */}
      {hasVideo && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Video Options
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {state.videoDuration && (
              <li className="flex items-center justify-between">
                <span>
                  Duration:{" "}
                  {getOptionLabel(state.videoDuration, VIDEO_DURATION_OPTIONS)}
                </span>
              </li>
            )}
            {state.videoStyle && (
              <li className="flex items-center justify-between">
                <span>
                  Style:{" "}
                  {getOptionLabel(state.videoStyle, VIDEO_STYLE_OPTIONS)}
                </span>
              </li>
            )}
            {state.aspectRatios && (
              <li>
                Aspect: {state.aspectRatios}
              </li>
            )}
            {state.music && (
              <li>
                Music:{" "}
                {getOptionLabel(state.music, MUSIC_OPTIONS)}
              </li>
            )}
            {state.aiOption && (
              <li>AI Option (+$20){state.aiNote ? `: ${state.aiNote}` : ""}</li>
            )}
            {state.boundaryDrawOption && (
              <li>Boundary Draw (+$10){state.boundaryDrawNote ? `: ${state.boundaryDrawNote}` : ""}</li>
            )}
            {state.textCaptions.length > 0 && (
              <li>Text: {state.textCaptions.join(", ")}</li>
            )}
            {state.transitions && (
              <li>
                Transitions:{" "}
                {getOptionLabel(state.transitions, TRANSITIONS_OPTIONS)}
              </li>
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

      {/* Estimated Total */}
      {estimatedPrice > 0 && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Subtotal
            </p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(estimatedPrice)}
            </p>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Estimated price, subject to change
          </p>
        </div>
      )}

      {state.selectedServices.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <Package className="h-8 w-8" />
          <p className="text-sm">No service selected</p>
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
          <span className="text-sm font-medium">Order Summary</span>
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
      <p className="text-sm font-semibold mb-3">Order Summary</p>
      {content}
    </div>
  );
}
