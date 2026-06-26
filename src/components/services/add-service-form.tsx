"use client";

import { useRef, useReducer, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import { ServiceTypeStep } from "./service-type-step";
import { ServiceDetailsStep } from "./service-details-step";
import { SummaryCard } from "./summary-card";
import {
  getInitialFormState,
  type AddServiceFormState,
} from "@/types/services";
import type { UploadedFile } from "@/components/ui/file-upload";

const STEPS = [
  { number: 1, label: "Chọn dịch vụ" },
  { number: 2, label: "Chi tiết dịch vụ" },
];

interface AddServiceFormProps {
  onSubmit?: (state: AddServiceFormState) => void;
}

export function AddServiceForm({ onSubmit }: AddServiceFormProps) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const formRef = useRef<AddServiceFormState>(getInitialFormState());
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof AddServiceFormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [musicFiles, setMusicFiles] = useState<UploadedFile[]>([]);

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
      setErrors({ selectedServices: "Vui lòng chọn ít nhất một dịch vụ." });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof AddServiceFormState, string>> = {};

    if (!formRef.current.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập họ và tên.";
    }

    if (!formRef.current.customerEmail.trim()) {
      newErrors.customerEmail = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formRef.current.customerEmail)) {
      newErrors.customerEmail = "Email không hợp lệ.";
    }

    if (!formRef.current.confirmRequirements) {
      newErrors.confirmRequirements =
        "Vui lòng xác nhận bạn đã cung cấp đầy đủ yêu cầu.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    const selectedServices = formRef.current.selectedServices;
    formRef.current = getInitialFormState();
    formRef.current.selectedServices = selectedServices;
    setErrors({});
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      setSubmitted(true);
      onSubmit?.(formRef.current);
    }
  };

  const handleReset = () => {
    formRef.current = getInitialFormState();
    setCurrentStep(1);
    setErrors({});
    setSubmitted(false);
    setMusicFiles([]);
    forceUpdate();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Đơn hàng đã được gửi!</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Cảm ơn bạn đã đặt dịch vụ. Chúng tôi sẽ liên hệ với bạn trong thời gian
          sớm nhất để xác nhận đơn hàng.
        </p>
        <Button onClick={handleReset} variant="outline" className="mt-4">
          Đặt dịch vụ mới
        </Button>
      </div>
    );
  }

  const nextDisabled = currentStep === 1 && formRef.current.selectedServices.length === 0;
  const submitDisabled =
    currentStep === 2 &&
    (!formRef.current.confirmRequirements || !formRef.current.confirmExtraCharges);

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
            />
          )}

          {errors.selectedServices && currentStep === 1 && (
            <p className="mt-4 text-sm text-destructive">
              {errors.selectedServices}
            </p>
          )}

          {/* Navigation */}
          <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-4 border-t bg-background/95 backdrop-blur-sm py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Quay lại
            </Button>

            {currentStep === 1 ? (
              <Button onClick={handleNext} disabled={nextDisabled}>
                Tiếp theo
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitDisabled}>
                Gửi đơn hàng
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
