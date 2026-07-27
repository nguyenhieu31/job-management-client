"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PHOTO_SERVICES,
  VIDEO_DURATION_OPTIONS,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  MUSIC_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
  PHOTO_ADDON_OPTIONS,
  PHOTO_QTY_MAX,
  AI_SCENE_PRICE,
  TEXT_2D_3D_PRICE,
  isVideoServiceSelected,
  isVirtualStagingSelected,
  isNonVirtualStagingPhotoSelected,
  isPhotoAddonEligible,
  getTotalPhotoQuantity,
  getVirtualStagingPhotoTotal,
  getPhotoAddOnPrice,
  clampPhotoQty,
  computeEstimatedPrice,
  type AddServiceFormState,
  type PhotoQuantities,
  type PhotoAddOns,
} from "@/types/services";
import { formatCurrency } from "@/lib/utils";
import { RadioGroupField } from "./radio-group-field";
import { TextareaField } from "./textarea-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SummaryCard } from "./summary-card";
import { UploadBlock } from "./upload-block";
import { Checkbox } from "@/components/ui/checkbox";
import type { UploadedFile } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

interface ServiceDetailsStepProps {
  state: AddServiceFormState;
  onChange: <K extends keyof AddServiceFormState>(
    field: K,
    value: AddServiceFormState[K],
  ) => void;
  errors: Partial<Record<keyof AddServiceFormState, string>>;
  onMusicFileChange: (files: UploadedFile[]) => void;
  attachmentFiles: UploadedFile[];
  onAttachmentFilesChange: (files: UploadedFile[]) => void;
  disableCustomerFields?: boolean;
}

const SINGLE_ONLY = ["talking-on-camera", "start-with-agent", "end-with-agent", "agent-voice-over", "no-agent"];

const renderCheckboxOption = (
  option: { value: string; label: string },
  checked: boolean,
  onChange: (checked: boolean) => void,
) => {
  return (
    <label
      key={option.value}
      className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(val) => onChange(val === true)}
        className="mt-0.5"
      />
      <div className="flex-1">
        <p className="text-sm font-medium leading-tight">{option.label}</p>
      </div>
    </label>
  );
};

function QuantityStepper({
  id,
  label,
  gloss,
  value,
  onValueChange,
}: {
  id: string;
  label: string;
  gloss?: string;
  value: number;
  onValueChange: (n: number) => void;
}) {
  const set = (raw: number) => onValueChange(clampPhotoQty(raw));
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {gloss && (
          <p className="text-[11px] text-muted-foreground">{gloss}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-11 p-0"
          aria-label={`Decrease ${label}`}
          disabled={value <= 0}
          onClick={() => set(value - 1)}
        >
          -
        </Button>
        <Input
          id={id}
          type="number"
          min={0}
          max={PHOTO_QTY_MAX}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            set(Number.isNaN(n) ? 0 : n);
          }}
          onBlur={(e) => {
            const n = parseInt(e.target.value, 10);
            set(Number.isNaN(n) ? 0 : n);
          }}
          className="h-11 w-20 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-11 p-0"
          aria-label={`Increase ${label}`}
          disabled={value >= PHOTO_QTY_MAX}
          onClick={() => set(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

export function ServiceDetailsStep({
  state,
  onChange,
  errors,
  onMusicFileChange,
  attachmentFiles,
  onAttachmentFilesChange,
  disableCustomerFields,
}: ServiceDetailsStepProps) {
  const hasVideo = isVideoServiceSelected(state.selectedServices);
  const hasVirtualStaging = isVirtualStagingSelected(state.selectedServices);
  const hasNonVSPhoto = isNonVirtualStagingPhotoSelected(state.selectedServices);
  const hasAddons = isPhotoAddonEligible(state.selectedServices);

  const selectedPhoto = PHOTO_SERVICES.find((s) =>
    state.selectedServices.includes(s.id),
  );
  const unitPrice = selectedPhoto?.price ?? 0;
  const totalPhotoQty = getTotalPhotoQuantity(state);
  const vsPhotoTotal = getVirtualStagingPhotoTotal(state);
  const photoBase = unitPrice * totalPhotoQty;
  const vsBase =
    (PHOTO_SERVICES.find((s) => s.id === "virtual-staging")?.price ?? 0) *
    vsPhotoTotal;

  const estimatedPrice = computeEstimatedPrice(state);
  const needsQty =
    hasNonVSPhoto || hasVirtualStaging;
  const formattedPrice =
    estimatedPrice > 0
      ? formatCurrency(estimatedPrice)
      : needsQty &&
          ((hasNonVSPhoto && totalPhotoQty === 0) ||
            (hasVirtualStaging && vsPhotoTotal === 0))
        ? "Enter quantities to estimate"
        : formatCurrency(0);

  const setRoomCount = useCallback(
    (room: string, n: number) => {
      onChange("virtualStagingRoomCounts", {
        ...state.virtualStagingRoomCounts,
        [room]: clampPhotoQty(n),
      });
    },
    [onChange, state.virtualStagingRoomCounts],
  );

  const setRoomNote = useCallback(
    (room: string, note: string) => {
      onChange("virtualStagingRoomNotes", {
        ...state.virtualStagingRoomNotes,
        [room]: note,
      });
    },
    [onChange, state.virtualStagingRoomNotes],
  );

  const setAddon = useCallback(
    <K extends keyof PhotoAddOns>(key: K, value: PhotoAddOns[K]) => {
      onChange("photoAddOns", {
        ...state.photoAddOns,
        [key]: value,
      });
    },
    [onChange, state.photoAddOns],
  );

  return (
    <div className="space-y-8">
      {/* 1. Customer Information */}
      <section className="space-y-6 rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Customer Information
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="e.g. John Doe"
              value={state.customerName}
              onChange={(e) => onChange("customerName", e.target.value)}
              className={errors.customerName ? "border-destructive" : ""}
            />
            {errors.customerName && (
              <p className="text-xs text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">
              Paypal Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerEmail"
              placeholder="john@example.com"
              value={state.customerEmail}
              onChange={(e) => onChange("customerEmail", e.target.value)}
              // disabled={disableCustomerFields}
              className={errors.customerEmail ? "border-destructive" : ""}
            />
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail}</p>
            )}
            {disableCustomerFields && (
              <p className="text-xs text-muted-foreground">Auto-filled from your account.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="realEstateAddress">Real Estate Address</Label>
            <Input
              id="realEstateAddress"
              placeholder="e.g. 123 Main St, City"
              value={state.realEstateAddress}
              onChange={(e) => onChange("realEstateAddress", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramHandle">
              Instagram <span className="text-destructive">*</span>
            </Label>
            <Input
              id="instagramHandle"
              placeholder="Instagram username"
              value={state.instagramHandle}
              onChange={(e) => onChange("instagramHandle", e.target.value)}
              className={errors.instagramHandle ? "border-destructive" : ""}
            />
            {errors.instagramHandle && (
              <p className="text-xs text-destructive">{errors.instagramHandle}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="websiteUrl">
              Website <span className="text-destructive">*</span>
            </Label>
            <Input
              id="websiteUrl"
              placeholder="https://yourwebsite.com"
              value={state.websiteUrl}
              onChange={(e) => onChange("websiteUrl", e.target.value)}
              className={errors.websiteUrl ? "border-destructive" : ""}
            />
            {errors.websiteUrl && (
              <p className="text-xs text-destructive">{errors.websiteUrl}</p>
            )}
          </div>
        </div>
      </section>

      {/* 2a. Photo quantities + add-ons (non-VS photo) */}
      <ConditionalSection show={hasNonVSPhoto}>
        <section
          id="photo-quantities-section"
          className={cn(
            "space-y-6 rounded-lg border bg-card p-4 sm:p-6",
            errors.photoQuantities && "border-destructive",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Photo Quantities <span className="text-destructive">*</span>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Quantity × {selectedPhoto?.label ?? "service"} unit price (
            {formatCurrency(unitPrice)}).
          </p>

          <fieldset className="space-y-3" aria-invalid={!!errors.photoQuantities}>
            <legend className="sr-only">Photo quantity</legend>
            <QuantityStepper
              id="photo-quantity"
              label={`${selectedPhoto?.label ?? "Photo"} Quantity`}
              value={state.photoQuantity ?? 0}
              onValueChange={(n) => onChange("photoQuantity", clampPhotoQty(n))}
            />
            <p className="text-sm font-medium">
              Total photos: {totalPhotoQty} · Base: {formatCurrency(photoBase)}
            </p>
            {errors.photoQuantities && (
              <p className="text-xs text-destructive" role="alert">
                {errors.photoQuantities}
              </p>
            )}
          </fieldset>

          {hasAddons ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">
                Replacement add-ons
              </legend>
              <div className="space-y-3">
                {PHOTO_ADDON_OPTIONS.map((opt) => {
                  const checked = !!state.photoAddOns?.[opt.key];
                  return (
                    <div key={opt.key} className="rounded-lg border p-3 space-y-2">
                      {renderCheckboxOption(
                        {
                          value: opt.key,
                          label: `${opt.label}${opt.price ? ` (+$${opt.price}/photo)` : ""}`,
                        },
                        checked,
                        (v) => setAddon(opt.key, v),
                      )}
                      {checked && totalPhotoQty === 0 && (
                        <p className="text-[11px] text-muted-foreground pl-1">
                          Add photo quantities above to price this add-on.
                        </p>
                      )}
                      {checked && opt.key === "grassReplacement" && (
                        <div className="pt-1 pb-1">
                          <QuantityStepper
                            id="grass-replacement-count"
                            label="Grass Replacement Photo Count (+$1.00/photo)"
                            gloss="Number of photos to apply grass replacement to"
                            value={state.photoAddOns?.grassReplacementCount ?? 0}
                            onValueChange={(n) => setAddon("grassReplacementCount", clampPhotoQty(n))}
                          />
                        </div>
                      )}
                      {checked && (
                        <TextareaField
                          id={`${opt.key}-note`}
                          label={`${opt.label} note`}
                          placeholder={opt.helper}
                          value={state.photoAddOns?.[opt.noteKey] ?? ""}
                          onChange={(v) => setAddon(opt.noteKey, v)}
                          rows={2}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <TextareaField
              id="photoServiceNote"
              label="Photo service notes"
              placeholder="Comments or special instructions for this photo service..."
              value={state.photoServiceNote}
              onChange={(v) => onChange("photoServiceNote", v)}
              rows={3}
            />
          )}
        </section>
      </ConditionalSection>

      {/* 2. Video Editing Options (conditional) */}
      <ConditionalSection show={hasVideo}>
        <section className="space-y-6 rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Video Editing Options
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Video Duration */}
            <div className="rounded-lg border p-4 space-y-3">
              <RadioGroupField
                name="videoDuration"
                legend="Video Duration"
                options={VIDEO_DURATION_OPTIONS}
                value={state.videoDuration}
                onChange={(v) => onChange("videoDuration", v)}
              />

              {state.videoDuration === "custom" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="customVideoDuration">Custom Duration (seconds)</Label>
                  <Input
                    id="customVideoDuration"
                    type="number"
                    min={1}
                    placeholder="Enter seconds..."
                    value={state.customVideoDuration}
                    onChange={(e) => onChange("customVideoDuration", e.target.value)}
                    className="max-w-xs"
                  />
                  {(() => {
                    const secs = parseInt(state.customVideoDuration, 10);
                    if (!Number.isFinite(secs) || secs < 1) return null;
                    if (secs < 60) {
                      return <p className="text-xs text-muted-foreground">Free (under 60s)</p>;
                    }
                    const extra = Math.floor((secs - 60) / 15);
                    const cost = extra * 10;
                    return (
                      <p className="text-xs text-muted-foreground">
                        {secs}s &middot; First 60s free &middot; {extra} × 15s = +${cost}
                      </p>
                    );
                  })()}
                </div>
              )}

              {state.videoDuration === "60s" && (
                <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Extended Duration (+15s per +1 step)</p>
                  <p className="text-[11px] text-muted-foreground">Requires 15s added for every +1 (+ $10.00 / step). Total duration: {60 + (state.videoDurationExtended || 0) * 15}s</p>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        onChange(
                          "videoDurationExtended",
                          Math.max(0, (state.videoDurationExtended || 0) - 1),
                        )
                      }
                      disabled={!state.videoDurationExtended}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium text-sm tabular-nums">
                      {state.videoDurationExtended || 0}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        onChange(
                          "videoDurationExtended",
                          (state.videoDurationExtended || 0) + 1,
                        )
                      }
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      +{(state.videoDurationExtended || 0) * 15}s = ${(state.videoDurationExtended || 0) * 10}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Style */}
            <div className="rounded-lg border p-4 space-y-3">
              <RadioGroupField
                name="videoStyle"
                legend="Video Editing Style"
                options={VIDEO_STYLE_OPTIONS}
                value={state.videoStyle}
                onChange={(v) => onChange("videoStyle", v)}
              />
            </div>

            {/* Aspect Ratio */}
            <div className="rounded-lg border p-4 space-y-3">
              <RadioGroupField
                name="aspectRatios"
                legend="Aspect Ratio"
                options={ASPECT_RATIO_OPTIONS}
                value={state.aspectRatios}
                onChange={(v) => onChange("aspectRatios", v)}
              />
            </div>

            {/* Background Music */}
            <div className="rounded-lg border p-4 space-y-3">
              <RadioGroupField
                name="music"
                legend="Background Music"
                options={MUSIC_OPTIONS}
                value={state.music}
                onChange={(v) => onChange("music", v)}
              />

              {state.music && state.music !== "no-music" && (
                <TextareaField
                  id="musicNote"
                  label="Music Note"
                  placeholder="Describe music style, mood, or specific track references..."
                  value={state.musicNote}
                  onChange={(v) => onChange("musicNote", v)}
                  rows={2}
                />
              )}

              {state.music === "i-will-provide" && (
                <div className="space-y-2">
                  <Label htmlFor="musicUpload">Upload Music File</Label>
                  <Input
                    id="musicUpload"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        onMusicFileChange([
                          {
                            file,
                            url: URL.createObjectURL(file),
                            name: file.name,
                            type: "image",
                          },
                        ]);
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Text & Captions — hidden from customers, visible to managers in order preview */}

            {/* Transitions — full width when text & captions are hidden */}
            <div className="rounded-lg border p-4 space-y-3 md:col-span-2">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Transitions</legend>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSITIONS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`transition-${option.value}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                        state.transitions === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                          state.transitions === option.value
                            ? "border-primary"
                            : "border-input",
                        )}
                      >
                        {state.transitions === option.value && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <input
                        type="radio"
                        id={`transition-${option.value}`}
                        name="transitions"
                        value={option.value}
                        checked={state.transitions === option.value}
                        onChange={() => onChange("transitions", option.value)}
                        className="sr-only"
                      />
                      <span className="text-sm leading-tight">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {state.transitions && (
                <TextareaField
                  id="transitionsNote"
                  label="Transitions Note"
                  placeholder="Describe transition style or specific effects..."
                  value={state.transitionsNote}
                  onChange={(v) => onChange("transitionsNote", v)}
                  rows={2}
                />
              )}
            </div>
          </div>

          {/* AI & Boundary Draw Options */}
          <div className="rounded-lg border p-4 space-y-3">
            <fieldset className="space-y-4">
              <legend className="text-sm font-medium">Additional Options</legend>

              <div className="space-y-2">
                {renderCheckboxOption(
                  { value: "aiOption", label: `AI Option (+$20)` },
                  state.aiOption,
                  (checked) => onChange("aiOption", checked),
                )}
                {state.aiOption && (
                  <TextareaField
                    id="aiNote"
                    label="AI Note"
                    placeholder="Enter requirements for AI option..."
                    value={state.aiNote}
                    onChange={(v) => onChange("aiNote", v)}
                    rows={2}
                  />
                )}
              </div>

              <div className="space-y-2">
                <QuantityStepper
                  id="aiSceneCount"
                  label={`AI Scenes (${formatCurrency(AI_SCENE_PRICE)}/scene)`}
                  gloss="Number of AI-generated scenes to process"
                  value={state.aiSceneCount}
                  onValueChange={(n) => onChange("aiSceneCount", n)}
                />
                {state.aiSceneCount > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-muted-foreground pl-1">
                      {state.aiSceneCount} × {formatCurrency(AI_SCENE_PRICE)} = {formatCurrency(state.aiSceneCount * AI_SCENE_PRICE)}
                    </p>
                    <TextareaField
                      id="aiSceneNote"
                      label="AI Scene Annotation & Note"
                      placeholder="Describe specific scenes, locations, or requirements for AI scenes..."
                      value={state.aiSceneNote ?? ""}
                      onChange={(v) => onChange("aiSceneNote", v)}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <QuantityStepper
                  id="text2d3dCount"
                  label={`2D/3D Text (${formatCurrency(TEXT_2D_3D_PRICE)}/text)`}
                  gloss="Convert spoken words into animated 2D/3D text elements"
                  value={state.text2d3dCount}
                  onValueChange={(n) => onChange("text2d3dCount", n)}
                />
                {state.text2d3dCount > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-muted-foreground pl-1">
                      {state.text2d3dCount} × {formatCurrency(TEXT_2D_3D_PRICE)} = {formatCurrency(state.text2d3dCount * TEXT_2D_3D_PRICE)}
                    </p>
                    <TextareaField
                      id="text2d3dNote"
                      label="2D/3D Text Annotation & Note"
                      placeholder="Enter text strings, positioning, or style notes for 2D/3D text..."
                      value={state.text2d3dNote ?? ""}
                      onChange={(v) => onChange("text2d3dNote", v)}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {renderCheckboxOption(
                  { value: "boundaryDrawOption", label: `Boundary Draw Option (+$10)` },
                  state.boundaryDrawOption,
                  (checked) => onChange("boundaryDrawOption", checked),
                )}
                {state.boundaryDrawOption && (
                  <TextareaField
                    id="boundaryDrawNote"
                    label="Boundary Draw Note"
                    placeholder="Enter requirements for Boundary Draw option..."
                    value={state.boundaryDrawNote}
                    onChange={(v) => onChange("boundaryDrawNote", v)}
                    rows={2}
                  />
                )}
              </div>
            </fieldset>
          </div>
        </section>

        <Separator />
      </ConditionalSection>

      {/* 3. Virtual Staging Section (conditional) */}
      <ConditionalSection show={hasVirtualStaging}>
        <section
          id="virtual-staging-section"
          className="space-y-6 rounded-lg border bg-card p-4 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Virtual Staging
            </h3>
          </div>

          <div
            className={cn(
              "space-y-3 rounded-lg border p-4",
              errors.virtualStagingStyle && "border-destructive",
            )}
          >
            <RadioGroupField
              name="virtualStagingStyle"
              legend="Style *"
              options={VIRTUAL_STAGING_STYLES}
              value={state.virtualStagingStyle}
              onChange={(v) => onChange("virtualStagingStyle", v)}
            />
            {errors.virtualStagingStyle && (
              <p className="text-xs text-destructive" role="alert">
                {errors.virtualStagingStyle}
              </p>
            )}
            <TextareaField
              id="virtualStagingStyleNote"
              label="Style notes"
              placeholder="Furniture style, mood, materials..."
              value={state.virtualStagingStyleNote}
              onChange={(v) => onChange("virtualStagingStyleNote", v)}
              rows={2}
            />
          </div>

          <fieldset
            className={cn(
              "space-y-3 rounded-lg border p-4",
              errors.virtualStagingRoomCounts && "border-destructive",
            )}
            aria-invalid={!!errors.virtualStagingRoomCounts}
          >
            <legend className="text-sm font-medium px-1">
              Rooms to stage <span className="text-destructive">*</span>
            </legend>
            <p className="text-xs text-muted-foreground">
              Enter how many photos to virtually stage as each room type. Total
              staged photos × unit price (
              {formatCurrency(
                PHOTO_SERVICES.find((s) => s.id === "virtual-staging")?.price ??
                  0,
              )}
              ).
            </p>
            <div className="grid gap-3">
              {VIRTUAL_STAGING_ROOMS.map((room) => (
                <div key={room.value} className="space-y-2 rounded-lg border p-3">
                  <QuantityStepper
                    id={`vs-room-${room.value}`}
                    label={`${room.label} (photos)`}
                    value={state.virtualStagingRoomCounts?.[room.value] ?? 0}
                    onValueChange={(n) => setRoomCount(room.value, n)}
                  />
                  {(state.virtualStagingRoomCounts?.[room.value] ?? 0) > 0 && (
                    <TextareaField
                      id={`vs-room-${room.value}-note`}
                      label="Image files note"
                      placeholder={`Which image files for ${room.label.toLowerCase()}?`}
                      value={state.virtualStagingRoomNotes?.[room.value] ?? ""}
                      onChange={(v) => setRoomNote(room.value, v)}
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              Total staged photos: {vsPhotoTotal} · Base:{" "}
              {formatCurrency(vsBase)}
            </p>
            {errors.virtualStagingRoomCounts && (
              <p className="text-xs text-destructive" role="alert">
                {errors.virtualStagingRoomCounts}
              </p>
            )}
            <TextareaField
              id="virtualStagingRoomsNote"
              label="Room notes"
              placeholder="Which images map to which room..."
              value={state.virtualStagingRoomsNote}
              onChange={(v) => onChange("virtualStagingRoomsNote", v)}
              rows={2}
            />
          </fieldset>
        </section>
      </ConditionalSection>

      {/* 4. Upload Files */}
      <section className="space-y-6 rounded-lg border bg-card p-4 sm:p-6">
        <UploadBlock
          value={state.uploadMethods}
          onChange={(v) => onChange("uploadMethods", v)}
          dropboxLink={state.dropboxLink}
          googleDriveLink={state.googleDriveLink}
          wetransferLink={state.wetransferLink}
          onLinkChange={onChange}
          files={attachmentFiles}
          onFilesChange={onAttachmentFilesChange}
          error={errors.uploadMethods}
        />
      </section>

      {/* 5. Estimated Price Summary */}
      {/* <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-lg font-semibold">Subtotal: {formattedPrice}</p>
            <p className="text-xs text-muted-foreground">
              This is an estimated price and may change based on actual requirements.
            </p>
          </div>
          <SummaryCard state={state} mobile />
        </div>
      </section> */}
  
      {/* 6. Order Notes */}
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="space-y-4">
          <TextareaField
            id="orderNotes"
            label="Order Notes"
            placeholder="Other special requests..."
            value={state.orderNotes}
            onChange={(v) => onChange("orderNotes", v)}
            rows={3}
          />
        </div>
      </section>

      {/* 7. Confirmation */}
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Confirm Revision Policy
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <Checkbox
              checked={state.confirmRequirements}
              onCheckedChange={(val) => onChange("confirmRequirements", val === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">
                I confirm I have provided all requirements before editing begins.
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <Checkbox
              checked={state.confirmExtraCharges}
              onCheckedChange={(val) => onChange("confirmExtraCharges", val === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">
                Additional requests not included in the original brief may
                incur extra charges.
              </p>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}

interface ConditionalSectionProps {
  show: boolean;
  children: React.ReactNode;
}

function ConditionalSection({ show, children }: ConditionalSectionProps) {
  if (!show) return null;
  return <>{children}</>;
}
