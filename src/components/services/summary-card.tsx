"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState } from "react";
import {
  PHOTO_SERVICES,
  VIDEO_SERVICES,
  VIDEO_DURATION_OPTIONS,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  MUSIC_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  PHOTO_ADDON_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
  AI_SCENE_PRICE,
  TEXT_2D_3D_PRICE,
  isVideoServiceSelected,
  isNonVirtualStagingPhotoSelected,
  isVirtualStagingSelected,
  isPhotoAddonEligible,
  getTotalPhotoQuantity,
  getVirtualStagingPhotoTotal,
  computeEstimatedPrice,
  type AddServiceFormState,
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
  if (photo?.price != null) return photo.price;
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
  const hasNonVSPhoto = isNonVirtualStagingPhotoSelected(state.selectedServices);
  const hasVS = isVirtualStagingSelected(state.selectedServices);
  const hasAddons = isPhotoAddonEligible(state.selectedServices);
  const estimatedPrice = computeEstimatedPrice(state);
  const totalQty = getTotalPhotoQuantity(state);
  const vsTotal = getVirtualStagingPhotoTotal(state);

  const content = (
    <div className="space-y-4">
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

      {state.selectedServices.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Services ({state.selectedServices.length})
          </p>
          <ul className="mt-1 space-y-0.5">
            {state.selectedServices.map((id) => {
              const unit = getServicePrice(id) ?? 0;
              let line: number | null = null;
              if (hasNonVSPhoto && PHOTO_SERVICES.some((s) => s.id === id)) {
                line = unit * totalQty;
              } else if (hasVS && id === "virtual-staging") {
                line = unit * vsTotal;
              } else if (hasVideo) {
                line = unit;
              }
              return (
                <li key={id} className="flex items-center justify-between text-sm gap-2">
                  <span className="min-w-0 truncate">{getServiceLabel(id)}</span>
                  {line != null && (
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {hasNonVSPhoto || hasVS
                        ? `${formatCurrency(unit)} × ${hasVS && id === "virtual-staging" ? vsTotal : totalQty} = ${formatCurrency(line)}`
                        : `+${formatCurrency(line)}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {hasNonVSPhoto && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Photo quantities
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            <li className="flex justify-between gap-2">
              <span>{getServiceLabel(state.selectedServices[0])} Quantity</span>
              <span className="tabular-nums text-muted-foreground">{totalQty}</span>
            </li>
            <li className="flex justify-between gap-2 font-medium pt-0.5">
              <span>Total</span>
              <span className="tabular-nums">{totalQty}</span>
            </li>
          </ul>
          {hasAddons && state.photoAddOns && (
            <ul className="mt-2 space-y-0.5 text-sm">
              {PHOTO_ADDON_OPTIONS.map((opt) => {
                if (!state.photoAddOns?.[opt.key]) return null;
                const isGrass = opt.key === "grassReplacement";
                const count = isGrass ? (state.photoAddOns.grassReplacementCount ?? 0) : totalQty;
                const cost = isGrass ? count * 1.0 : (opt.price ?? 0) * totalQty;
                return (
                  <li key={opt.key} className="flex justify-between gap-2">
                    <span>
                      {opt.label} {isGrass ? `(${count} photos)` : ""}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      +{formatCurrency(cost)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {!hasAddons && state.photoServiceNote?.trim() && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              Note: {state.photoServiceNote}
            </p>
          )}
        </div>
      )}

      {hasVS && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Virtual Staging
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {state.virtualStagingStyle && (
              <li>
                Style:{" "}
                {getOptionLabel(state.virtualStagingStyle, VIRTUAL_STAGING_STYLES)}
              </li>
            )}
            {VIRTUAL_STAGING_ROOMS.map((room) => {
              const n = state.virtualStagingRoomCounts?.[room.value] ?? 0;
              if (n <= 0) return null;
              return (
                <li key={room.value} className="flex justify-between gap-2">
                  <span>{room.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {n} photos
                  </span>
                </li>
              );
            })}
            {vsTotal === 0 && (
              <li className="text-xs text-muted-foreground">No room counts yet</li>
            )}
          </ul>
        </div>
      )}

      {hasVideo && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Video Options
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {state.videoDuration && (
              <li>
                Duration:{" "}
                {getOptionLabel(state.videoDuration, VIDEO_DURATION_OPTIONS)}
                {state.videoDuration === "60s" && (state.videoDurationExtended || 0) > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (+{state.videoDurationExtended * 15}s = {60 + state.videoDurationExtended * 15}s total, +${state.videoDurationExtended * 10})
                  </span>
                )}
              </li>
            )}
            {state.videoStyle && (
              <li>
                Style: {getOptionLabel(state.videoStyle, VIDEO_STYLE_OPTIONS)}
              </li>
            )}
            {state.aspectRatios && <li>Aspect: {state.aspectRatios}</li>}
            {state.music && (
              <li>Music: {getOptionLabel(state.music, MUSIC_OPTIONS)}</li>
            )}
            {state.aiOption && (
              <li>
                AI Voiceover (+$20)
                {state.aiNote ? `: ${state.aiNote}` : ""}
              </li>
            )}
            {state.aiSceneCount > 0 && (
              <li className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-2">
                  <span>AI Scenes</span>
                  <span className="tabular-nums text-muted-foreground">
                    {state.aiSceneCount} × {formatCurrency(AI_SCENE_PRICE)} = {formatCurrency(state.aiSceneCount * AI_SCENE_PRICE)}
                  </span>
                </div>
                {state.aiSceneNote && (
                  <p className="text-xs text-muted-foreground">Note: {state.aiSceneNote}</p>
                )}
              </li>
            )}
            {state.text2d3dCount > 0 && (
              <li className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-2">
                  <span>Transfer Text 2D/3D</span>
                  <span className="tabular-nums text-muted-foreground">
                    {state.text2d3dCount} × {formatCurrency(TEXT_2D_3D_PRICE)} = {formatCurrency(state.text2d3dCount * TEXT_2D_3D_PRICE)}
                  </span>
                </div>
                {state.text2d3dNote && (
                  <p className="text-xs text-muted-foreground">Note: {state.text2d3dNote}</p>
                )}
              </li>
            )}
            {state.boundaryDrawOption && (
              <li>
                Boundary Draw (+$10)
                {state.boundaryDrawNote ? `: ${state.boundaryDrawNote}` : ""}
              </li>
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

      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Subtotal
          </p>
          <p className="text-sm font-bold text-primary">
            {estimatedPrice > 0
              ? formatCurrency(estimatedPrice)
              : hasNonVSPhoto || hasVS
                ? "Enter quantities"
                : formatCurrency(0)}
          </p>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Estimated price, subject to change
        </p>
      </div>

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
        {isOpen && <div className="border-t p-3">{content}</div>}
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
