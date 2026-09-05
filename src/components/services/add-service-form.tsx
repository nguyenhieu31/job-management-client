"use client";

import { useRef, useReducer, useState, useCallback, useEffect } from "react";
import { Loader2, CheckCircle2, Copy, Check, Mail, Receipt, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { StepIndicator } from "./step-indicator";
import { ServiceTypeStep } from "./service-type-step";
import { ServiceDetailsStep } from "./service-details-step";
import { SummaryCard } from "./summary-card";
import {
  getInitialFormState,
  getTotalPhotoQuantity,
  getVirtualStagingPhotoTotal,
  isNonVirtualStagingPhotoSelected,
  isVirtualStagingSelected,
  computeEstimatedPrice,
  type AddServiceFormState,
} from "@/types/services";
import type { UploadedFile } from "@/components/ui/file-upload";
import type { OrderResponse } from "@/types/orders";

const STEPS = [
  { number: 1, label: "Choose Service" },
  { number: 2, label: "Service Details" },
];

interface AddServiceFormProps {
  onSubmit?: (
    state: AddServiceFormState,
    attachments: { file: File; type: "image" | "video" }[],
  ) => Promise<OrderResponse | void> | void;
  submitting?: boolean;
  initialState?: Partial<AddServiceFormState>;
}

type SubmitAttachment = { file: File; type: "image" | "video" };

export function AddServiceForm({
  onSubmit,
  submitting = false,
  initialState,
}: AddServiceFormProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const formRef = useRef<AddServiceFormState>({
    ...getInitialFormState(),
    ...initialState,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof AddServiceFormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [musicFiles, setMusicFiles] = useState<UploadedFile[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (initialState) {
      formRef.current = {
        ...formRef.current,
        ...initialState,
      };
      forceUpdate();
    }
  }, [initialState]);

  const onChange = useCallback(
    <K extends keyof AddServiceFormState>(
      field: K,
      value: AddServiceFormState[K],
    ) => {
      formRef.current[field] = value;
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
      forceUpdate();
    },
    [errors],
  );

  const validateStep1 = (): boolean => {
    if (formRef.current.selectedServices.length === 0) {
      setErrors({ selectedServices: "Please select at least one service." });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof AddServiceFormState, string>> = {};
    const state = formRef.current;

    if (!state.customerName.trim()) {
      newErrors.customerName = "Please enter your full name.";
    }

    if (!state.customerEmail.trim()) {
      newErrors.customerEmail = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customerEmail)) {
      newErrors.customerEmail = "Invalid email format.";
    }

    if (!state.instagramHandle.trim()) {
      newErrors.instagramHandle = "Please enter your Instagram handle.";
    }

    if (!state.realEstateAddress.trim()) {
      newErrors.realEstateAddress = "Please enter the real estate address.";
    }

    if (!state.websiteUrl.trim()) {
      newErrors.websiteUrl = "Please enter your website URL.";
    }

    if (isNonVirtualStagingPhotoSelected(state.selectedServices)) {
      if (getTotalPhotoQuantity(state) < 1) {
        newErrors.photoQuantities =
          "Enter at least 1 photo across Single Exposure, Blended Brackets, or Flambient.";
      }
    }

    if (isVirtualStagingSelected(state.selectedServices)) {
      if (!state.virtualStagingStyle?.trim()) {
        newErrors.virtualStagingStyle = "Select a staging style.";
      }
      if (getVirtualStagingPhotoTotal(state) < 1) {
        newErrors.virtualStagingRoomCounts =
          "Enter at least 1 photo count for a room type.";
      }
    }

    if (!state.confirmRequirements) {
      newErrors.confirmRequirements =
        "Please confirm you have provided all requirements.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el =
        document.getElementById("photo-quantities-section") ||
        document.getElementById("virtual-staging-section") ||
        document.getElementById(
          firstKey === "customerName"
            ? "customerName"
            : firstKey === "customerEmail"
              ? "customerEmail"
              : "",
        );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setErrors({});
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (validateStep2()) {
      setSubmitted(true);
      const attachmentEntries = attachmentFiles
        .filter((f) => !!f.file)
        .map<SubmitAttachment>((f) => ({
          file: f.file as File,
          type: f.type,
        }));
      const musicEntries = musicFiles
        .filter((f) => !!f.file)
        .map<SubmitAttachment>((f) => ({
          file: f.file as File,
          type: f.type,
        }));
      try {
        const result = await onSubmit?.(formRef.current, [...attachmentEntries, ...musicEntries]);
        if (result) {
          setCreatedOrder(result as OrderResponse);
        }
      } catch (err) {
        setSubmitted(false);
      }
    }
  };

  const handleReset = () => {
    formRef.current = getInitialFormState();
    setCurrentStep(1);
    setErrors({});
    setSubmitted(false);
    setCreatedOrder(null);
    setCopied(false);
    setMusicFiles([]);
    setAttachmentFiles([]);
    forceUpdate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyCode = () => {
    const code = createdOrder?.code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submitted) {
    const orderCode = createdOrder?.code;
    const customerEmail = createdOrder?.customerEmail || formRef.current.customerEmail;
    const customerName = createdOrder?.customerName || formRef.current.customerName;
    const estimatedPrice = createdOrder?.estimatedPrice ?? computeEstimatedPrice(formRef.current);

    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border bg-card p-6 sm:p-10 text-center shadow-sm">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full transition-all",
              submitting ? "bg-muted animate-pulse" : "bg-primary/10 text-primary",
            )}
          >
            {submitting ? (
              <Loader2
                className="h-10 w-10 animate-spin text-primary"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-10 w-10 text-primary"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {submitting ? "Processing your order..." : "Order Submitted Successfully!"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {submitting
                ? "We are uploading your attachments and registering your order. Please do not close this window."
                : "Thank you for choosing our service! We have received your order details and our production team will get started right away."}
            </p>
          </div>

          {submitting && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Uploading files and sending your order to the team...
            </div>
          )}

          {!submitting && (
            <div className="w-full space-y-4 text-left">
              {/* Order Code Box */}
              {orderCode && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order Reference Code
                    </span>
                    <p className="font-mono text-xl font-bold text-primary">{orderCode}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="shrink-0 gap-1.5 self-start sm:self-auto"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-xs">Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground">Confirmation sent to</span>
                    <p className="font-medium truncate">{customerEmail || "\u2014"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Receipt className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Estimated Total</span>
                    <p className="font-medium font-mono text-primary">
                      {estimatedPrice > 0 ? formatCurrency(estimatedPrice) : "\u2014"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:col-span-2 pt-2 border-t text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>
                    Our editor will review the files and contact you via {customerEmail} or Instagram to confirm before final delivery.
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleReset}
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  Book Another Service
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const nextDisabled =
    submitting || (currentStep === 1 && formRef.current.selectedServices.length === 0);
  const submitDisabled =
    submitting ||
    (currentStep === 2 &&
      (!formRef.current.confirmRequirements || !formRef.current.confirmExtraCharges));

  return (
    <div className="mx-auto max-w-6xl">
      {/* Step Indicator */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b mb-6">
        <StepIndicator currentStep={currentStep} steps={STEPS} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Mobile Summary */}
        <div className="lg:hidden">
          <SummaryCard state={formRef.current} mobile />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {currentStep === 1 && (
            <ServiceTypeStep
              value={formRef.current.selectedServices}
              onChange={(services) => onChange("selectedServices", services)}
            />
          )}

          {currentStep === 2 && (
            <ServiceDetailsStep
              state={formRef.current}
              onChange={onChange}
              errors={errors}
              onMusicFileChange={setMusicFiles}
              attachmentFiles={attachmentFiles}
              onAttachmentFilesChange={setAttachmentFiles}
            />
          )}

          {errors.selectedServices && currentStep === 1 && (
            <p className="mt-4 text-sm text-destructive">
              {errors.selectedServices}
            </p>
          )}

          {submitting && (
            <div
              role="status"
              aria-live="polite"
              className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>
                Uploading attachments and sending your order, please wait a moment...
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-4 border-t bg-background/95 backdrop-blur-sm py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || submitting}
            >
              Back
            </Button>

            {currentStep === 1 ? (
              <Button onClick={handleNext} disabled={nextDisabled}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitDisabled}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending order...
                  </>
                ) : (
                  "Send Order"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Summary Sidebar */}
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-28">
            <SummaryCard state={formRef.current} />
          </div>
        </div>
      </div>
    </div>
  );
}
