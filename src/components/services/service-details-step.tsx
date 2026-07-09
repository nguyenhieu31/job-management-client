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
  VIDEO_DURATION_OPTIONS,
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
  computeEstimatedPrice,
  type AddServiceFormState,
} from "@/types/services";
import type { UploadedFile } from "@/components/ui/file-upload";

const formatPrice = (price: number) =>
  `${price.toLocaleString("vi-VN")}₫`;

interface ServiceDetailsStepProps {
  state: AddServiceFormState;
  onChange: <K extends keyof AddServiceFormState>(
    field: K,
    value: AddServiceFormState[K],
  ) => void;
  errors: Partial<Record<keyof AddServiceFormState, string>>;
  onMusicFileChange: (files: UploadedFile[]) => void;
}

export function ServiceDetailsStep({
  state,
  onChange,
  errors,
  onMusicFileChange,
}: ServiceDetailsStepProps) {
  const hasVideo = isVideoServiceSelected(state.selectedServices);
  const hasVirtualStaging = isVirtualStagingSelected(state.selectedServices);
  const estimatedPrice = computeEstimatedPrice(state);

  const renderCheckboxOption = (
    option: { value: string; label: string; price?: number },
    checked: boolean,
    onChangeChecked: (checked: boolean) => void,
  ) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-muted-foreground/30">
      <Checkbox checked={checked} onCheckedChange={onChangeChecked} />
      <span className="text-sm">{option.label}</span>
      {option.price != null && (
        <span className="ml-auto text-xs text-muted-foreground">
          +{formatPrice(option.price)}
        </span>
      )}
    </label>
  );

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
              className={errors.customerEmail ? "border-destructive" : ""}
            />
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail}</p>
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
          <div className="space-y-2">
            <Label htmlFor="zaloId">Zalo</Label>
            <Input
              id="zaloId"
              placeholder="Số điện thoại Zalo"
              value={state.zaloId}
              onChange={(e) => onChange("zaloId", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagramHandle">Instagram</Label>
            <Input
              id="instagramHandle"
              placeholder="Tên tài khoản Instagram"
              value={state.instagramHandle}
              onChange={(e) => onChange("instagramHandle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input
              id="websiteUrl"
              placeholder="https://..."
              value={state.websiteUrl}
              onChange={(e) => onChange("websiteUrl", e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* 2. Video Editing Sections (conditional) */}
      <ConditionalSection show={hasVideo}>
        <section className="space-y-8 rounded-lg border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Video Editing Options
            </h3>
          </div>

          <RadioGroupField
            name="videoDuration"
            legend="Thời lượng video"
            options={VIDEO_DURATION_OPTIONS}
            value={state.videoDuration}
            onChange={(v) => onChange("videoDuration", v)}
          />

          {state.videoDuration === "custom" && (
            <div className="pl-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="customVideoDuration">Thời lượng tùy chỉnh</Label>
              <Input
                id="customVideoDuration"
                placeholder="Nhập số giây..."
                type="number"
                min={1}
                value={state.customVideoDuration}
                onChange={(e) =>
                  onChange("customVideoDuration", e.target.value)
                }
              />
            </div>
          )}

          <Separator />

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
              {ASPECT_RATIO_OPTIONS.map((option) =>
                renderCheckboxOption(
                  option,
                  state.aspectRatios.includes(option.value),
                  (checked) => {
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
                  },
                ),
              )}
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
              {REALTOR_AGENT_OPTIONS.map((option) =>
                renderCheckboxOption(
                  option,
                  state.realtorAgent.includes(option.value),
                  (checked) => {
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
                  },
                ),
              )}
            </div>
          </fieldset>

          <Separator />

          {/* Text & Captions */}
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
              {VIRTUAL_STAGING_ROOMS.map((room) =>
                renderCheckboxOption(
                  room,
                  state.virtualStagingRooms.includes(room.value),
                  (checked) => {
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
                  },
                ),
              )}
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

      {/* 4. Estimated Total */}
      {estimatedPrice > 0 && (
        <section className="rounded-lg border bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Tạm tính:</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(estimatedPrice)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Đây là giá ước tính, có thể thay đổi dựa trên yêu cầu thực tế.
          </p>
        </section>
      )}

      {/* 5. Upload Files */}
      <section>
        <UploadBlock
          value={state.uploadMethods}
          onChange={(v) => onChange("uploadMethods", v)}
          dropboxLink={state.dropboxLink}
          googleDriveLink={state.googleDriveLink}
          wetransferLink={state.wetransferLink}
          onLinkChange={onChange}
          files={[]}
          onFilesChange={() => {}}
          error={errors.uploadMethods}
        />
      </section>

      <Separator />

      {/* 6. Order Notes */}
      <section className="space-y-2">
        <Label htmlFor="orderNotes">Ghi chú đơn hàng</Label>
        <Input
          id="orderNotes"
          placeholder="Yêu cầu đặc biệt khác..."
          value={state.orderNotes}
          onChange={(e) => onChange("orderNotes", e.target.value)}
        />
      </section>

      <Separator />

      {/* 7. Revision Policy Confirmation */}
      <section className="space-y-4 rounded-lg border bg-amber-50/50 p-4 sm:p-6">
        <h3 className="text-sm font-semibold">Xác nhận chính sách sửa đổi</h3>
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
              Tôi xác nhận đã cung cấp tất cả yêu cầu trước khi chỉnh sửa.
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
              Các yêu cầu bổ sung không có trong nội dung ban đầu có thể phát
              sinh thêm phí.
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
