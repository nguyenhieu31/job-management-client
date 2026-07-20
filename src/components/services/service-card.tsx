"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check, ImageIcon } from "lucide-react";
import { getServiceSampleImages } from "@/types/services";

interface ServiceCardProps {
  id: string;
  label: string;
  subtitle: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
  disabled?: boolean;
  samplesAvailable?: boolean;
  onViewSamples?: (id: string) => void;
  isVideo?: boolean;
}

function preloadImages(serviceId: string) {
  const samples = getServiceSampleImages(serviceId);
  for (const pair of samples) {
    if (pair.video) {
      const video = document.createElement('video');
      video.src = pair.video;
    } else {
      const img = new Image();
      img.src = pair.before ? pair.before : '';
      const img2 = new Image();
      img2.src = pair.after ? pair.after : '';
    }
  }
}

export function ServiceCard({
  id,
  label,
  subtitle,
  checked,
  onChange,
  disabled = false,
  samplesAvailable,
  onViewSamples,
  isVideo = false,
}: ServiceCardProps) {
  const handleViewSamples = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onViewSamples?.(id);
  };

  const handleHover = useCallback(() => {
    preloadImages(id);
  }, [id]);

  return (
    <label
      htmlFor={`service-${id}`}
      className={cn(
        "relative flex cursor-pointer flex-col gap-1.5 rounded-lg border p-4 transition-all duration-200",
        checked
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-tight">{label}</p>
          <p className="text-xs text-muted-foreground leading-snug">
            {subtitle}
          </p>
        </div>
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200",
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input",
          )}
        >
          {checked && <Check className="h-3.5 w-3.5" />}
        </div>
      </div>
      {samplesAvailable && onViewSamples && (
        <button
          type="button"
          onClick={handleViewSamples}
          onMouseEnter={handleHover}
          className="mt-1 flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
        >
          <ImageIcon className="h-3 w-3" />
          {isVideo ? "View Video Sample" : "View Image Sample"}
        </button>
      )}
      <input
        type="checkbox"
        id={`service-${id}`}
        checked={checked}
        onChange={(e) => onChange(id, e.target.checked)}
        disabled={disabled}
        className="sr-only"
        aria-label={label}
      />
    </label>
  );
}
