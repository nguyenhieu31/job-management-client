"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroupField } from "./radio-group-field";
import { ConditionalSection } from "./conditional-section";
import { TextareaField } from "./textarea-field";
import { UploadBlock } from "./upload-block";
import { Separator } from "@/components/ui/separator";
import {
  TURNAROUND_OPTIONS,
  VIDEO_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  MUSIC_OPTIONS,
  REALTOR_AGENT_OPTIONS,
  TEXT_CAPTIONS_OPTIONS,
  TRANSITIONS_OPTIONS,
  CREATIVE_FREEDOM_OPTIONS,
  VIRTUAL_STAGING_ROOMS,
  VIRTUAL_STAGING_STYLES,
  isVideoServiceSelected,
  isVirtualStagingSelected,
  type AddServiceFormState,
} from "@/types/services";
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

  return (
    <div className="space-y-8">
      {/* 1. Customer Information */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Thông tin khách hàng</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="Nguyễn Văn A"
              value={state.customerName}
              onChange={(e) => onChange("customerName", e.target.value)}
              readOnly={disableCustomerFields}
              className={errors.customerName ? "border-destructive" : ""}
            />
            {errors.customerName && (
              <p className="text-xs text-destructive">{errors.customerName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="example@email.com"
              value={state.customerEmail}
              onChange={(e) => onChange("customerEmail", e.target.value)}
              readOnly={disableCustomerFields}
              className={errors.customerEmail ? "border-destructive" : ""}
            />
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail}</p>
            )}
            {disableCustomerFields && (
              <p className="text-xs text-muted-foreground">
                Đã được điền tự động từ tài khoản của bạn.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Số điện thoại</Label>
            <Input
              id="customerPhone"
              placeholder="+84 123 456 789"
              value={state.customerPhone}
              onChange={(e) => onChange("customerPhone", e.target.value)}
            />
          </div>
        </div>
      </section>

      <TextareaField
        id="orderNotes"
        label="Ghi chú đơn hàng"
        placeholder="Yêu cầu đặc biệt khác..."
        value={state.orderNotes}
        onChange={(v) => onChange("orderNotes", v)}
        rows={4}
      />

      <Separator />

      {/* 2. Turnaround Time */}
      <section>
        <RadioGroupField
          name="turnaround"
          legend="Thời gian hoàn thành"
          options={TURNAROUND_OPTIONS}
          value={state.turnaround}
          onChange={(v) => onChange("turnaround", v)}
          error={errors.turnaround}
        />
      </section>

      <Separator />

      {/* 3. Video Editing Sections (conditional) */}
      <ConditionalSection show={hasVideo}>
        <section className="space-y-8 rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Video Editing Options
            </h3>
          </div>

          <RadioGroupField
            name="videoStyle"
            legend="Phong cách chỉnh sửa video"
            options={VIDEO_STYLE_OPTIONS}
            value={state.videoStyle}
            onChange={(v) => onChange("videoStyle", v)}
          />

          <Separator />

          {/* Aspect Ratio */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Tỷ lệ khung hình</legend>
            <div className="grid gap-2">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`aspect-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-muted-foreground/30"
                >
                  <Checkbox
                    id={`aspect-${option.value}`}
                    checked={state.aspectRatios.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange("aspectRatios", [
                          ...state.aspectRatios,
                          option.value,
                        ]);
                      } else {
                        onChange(
                          "aspectRatios",
                          state.aspectRatios.filter((v) => v !== option.value),
                        );
                      }
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Separator />

          {/* Music */}
          <RadioGroupField
            name="music"
            legend="Nhạc nền"
            options={MUSIC_OPTIONS}
            value={state.music}
            onChange={(v) => onChange("music", v)}
          />

          {state.music === "i-will-provide" && (
            <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>Tải lên tệp nhạc</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
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

          <Separator />

          {/* Realtor / Agent */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Realtor / Agent</legend>
            <div className="grid gap-2">
              {REALTOR_AGENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`agent-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-muted-foreground/30"
                >
                  <Checkbox
                    id={`agent-${option.value}`}
                    checked={state.realtorAgent.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange("realtorAgent", [
                          ...state.realtorAgent,
                          option.value,
                        ]);
                      } else {
                        onChange(
                          "realtorAgent",
                          state.realtorAgent.filter((v) => v !== option.value),
                        );
                      }
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Separator />

          {/* Text & Captions */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Text & Captions</legend>
            <div className="grid gap-2">
              {TEXT_CAPTIONS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`caption-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-muted-foreground/30"
                >
                  <Checkbox
                    id={`caption-${option.value}`}
                    checked={state.textCaptions.includes(option.value)}
                    onCheckedChange={(checked) => {
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
                    }}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Separator />

          {/* Transitions */}
          <RadioGroupField
            name="transitions"
            legend="Transitions"
            options={TRANSITIONS_OPTIONS}
            value={state.transitions}
            onChange={(v) => onChange("transitions", v)}
          />

          <Separator />

          {/* Required Shots */}
          <TextareaField
            id="requiredShots"
            label="Required Shots"
            placeholder="List the shots that must appear in the final video."
            value={state.requiredShots}
            onChange={(v) => onChange("requiredShots", v)}
            rows={3}
          />

          {/* Excluded Shots */}
          <TextareaField
            id="excludedShots"
            label="Excluded Shots"
            placeholder="List the shots that must not be used."
            value={state.excludedShots}
            onChange={(v) => onChange("excludedShots", v)}
            rows={3}
          />

          {/* Reference Videos */}
          <TextareaField
            id="referenceVideos"
            label="Reference Videos"
            placeholder="Paste YouTube, Instagram, or Vimeo links for style reference."
            value={state.referenceVideos}
            onChange={(v) => onChange("referenceVideos", v)}
            rows={3}
          />

          <Separator />

          {/* Creative Freedom */}
          <RadioGroupField
            name="creativeFreedom"
            legend="Creative Freedom"
            options={CREATIVE_FREEDOM_OPTIONS}
            value={state.creativeFreedom}
            onChange={(v) => onChange("creativeFreedom", v)}
          />
        </section>

        <Separator />
      </ConditionalSection>

      {/* 4. Virtual Staging Section (conditional) */}
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
              {VIRTUAL_STAGING_ROOMS.map((room) => (
                <label
                  key={room.value}
                  htmlFor={`vs-room-${room.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-muted-foreground/30"
                >
                  <Checkbox
                    id={`vs-room-${room.value}`}
                    checked={state.virtualStagingRooms.includes(room.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange("virtualStagingRooms", [
                          ...state.virtualStagingRooms,
                          room.value,
                        ]);
                      } else {
                        onChange(
                          "virtualStagingRooms",
                          state.virtualStagingRooms.filter(
                            (v) => v !== room.value,
                          ),
                        );
                      }
                    }}
                  />
                  <span className="text-sm">{room.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <RadioGroupField
            name="vsStyle"
            legend="Style"
            options={VIRTUAL_STAGING_STYLES}
            value={state.virtualStagingStyle}
            onChange={(v) => onChange("virtualStagingStyle", v)}
          />
        </section>

        <Separator />
      </ConditionalSection>

      {/* 5. Upload Files */}
      <section>
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

      <Separator />

      {/* 6. Revision Policy Confirmation */}
      <section className="space-y-4 rounded-lg border bg-amber-50/50 p-4 sm:p-6">
        <h3 className="text-sm font-semibold">Revision Policy Confirmation</h3>
        <div className="space-y-3">
          <label
            htmlFor="confirmRequirements"
            className="flex cursor-pointer items-start gap-3"
          >
            <Checkbox
              id="confirmRequirements"
              checked={state.confirmRequirements}
              onCheckedChange={(checked) =>
                onChange("confirmRequirements", checked === true)
              }
            />
            <span className="text-sm leading-tight">
              I confirm I have provided all requirements before editing begins.
            </span>
          </label>
          <label
            htmlFor="confirmExtraCharges"
            className="flex cursor-pointer items-start gap-3"
          >
            <Checkbox
              id="confirmExtraCharges"
              checked={state.confirmExtraCharges}
              onCheckedChange={(checked) =>
                onChange("confirmExtraCharges", checked === true)
              }
            />
            <span className="text-sm leading-tight">
              Additional requests not included in the original brief may incur
              extra charges.
            </span>
          </label>
        </div>
        {errors.confirmRequirements && (
          <p className="text-xs text-destructive">
            {errors.confirmRequirements}
          </p>
        )}
      </section>
    </div>
  );
}
