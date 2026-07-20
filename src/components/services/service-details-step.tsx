"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  VIDEO_DURATION_OPTIONS,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  MUSIC_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
  isVideoServiceSelected,
  isVirtualStagingSelected,
  computeEstimatedPrice,
  type AddServiceFormState,
} from "@/types/services";
import { RadioGroupField } from "./radio-group-field";
import { TextareaField } from "./textarea-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SummaryCard } from "./summary-card";
import { UploadBlock } from "./upload-block";
import { Checkbox } from "@/components/ui/checkbox";
import type { UploadedFile } from "@/components/ui/file-upload";

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

  const estimatedPrice = computeEstimatedPrice(state);
  const formattedPrice =
    estimatedPrice > 0
      ? estimatedPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })
      : "Free";

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
              disabled={disableCustomerFields}
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
            <Label htmlFor="instagramHandle">Instagram</Label>
            <Input
              id="instagramHandle"
              placeholder="Instagram username"
              value={state.instagramHandle}
              onChange={(e) => onChange("instagramHandle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input
              id="websiteUrl"
              placeholder="https://yourwebsite.com"
              value={state.websiteUrl}
              onChange={(e) => onChange("websiteUrl", e.target.value)}
            />
          </div>
        </div>
      </section>

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
                </div>
              )}

              <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Extended Duration</p>
                <p className="text-[11px] text-muted-foreground">First 60s free. Each extra 15s: +$10</p>
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
                    × 15s = ${(state.videoDurationExtended || 0) * 10}
                  </span>
                </div>
              </div>
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

            {/* Text & Captions */}
            <div className="rounded-lg border p-4 space-y-3">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Text & Captions</legend>
                <div className="grid gap-2">
                  {TEXT_CAPTIONS_OPTIONS.map((option) =>
                    renderCheckboxOption(
                      option,
                      state.textCaptions.includes(option.value),
                      (checked) => {
                        if (checked) {
                          onChange("textCaptions", [
                            ...state.textCaptions,
                            option.value,
                          ]);
                        } else {
                          onChange(
                            "textCaptions",
                            state.textCaptions.filter((v) => v !== option.value),
                          );
                        }
                      },
                    ),
                  )}
                </div>
                {state.textCaptions.length > 0 && (
                  <TextareaField
                    id="textCaptionsNote"
                    label="Text & Captions Note"
                    placeholder="Specify text content, font style, positioning..."
                    value={state.textCaptionsNote}
                    onChange={(v) => onChange("textCaptionsNote", v)}
                    rows={2}
                  />
                )}
              </fieldset>
            </div>

            {/* Transitions */}
            <div className="rounded-lg border p-4 space-y-3">
              <RadioGroupField
                name="transitions"
                legend="Transitions"
                options={TRANSITIONS_OPTIONS}
                value={state.transitions}
                onChange={(v) => onChange("transitions", v)}
              />

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
        <section className="space-y-6 rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Virtual Staging
            </h3>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Room Type</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {VIRTUAL_STAGING_ROOMS.map((option) =>
                renderCheckboxOption(
                  option,
                  state.virtualStagingRooms.includes(option.value),
                  (checked) => {
                    if (checked) {
                      onChange("virtualStagingRooms", [
                        ...state.virtualStagingRooms,
                        option.value,
                      ]);
                    } else {
                      onChange(
                        "virtualStagingRooms",
                        state.virtualStagingRooms.filter(
                          (v) => v !== option.value,
                        ),
                      );
                    }
                  },
                ),
              )}
            </div>
          </fieldset>

          <RadioGroupField
            name="virtualStagingStyle"
            legend="Virtual Staging Style"
            options={VIRTUAL_STAGING_STYLES}
            value={state.virtualStagingStyle}
            onChange={(v) => onChange("virtualStagingStyle", v)}
          />
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
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-lg font-semibold">Subtotal: {formattedPrice}</p>
            <p className="text-xs text-muted-foreground">
              This is an estimated price and may change based on actual requirements.
            </p>
          </div>
          <SummaryCard state={state} mobile />
        </div>
      </section>

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
