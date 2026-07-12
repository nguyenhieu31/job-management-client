"use client";

import { useState } from "react";
import { ServiceCard } from "./service-card";
import { ServiceSampleDialog } from "./service-sample-dialog";
import {
  PHOTO_SERVICES,
  VIDEO_SERVICES,
} from "@/types/services";

interface ServiceTypeStepProps {
  value: string[];
  onChange: (services: string[]) => void;
}

export function ServiceTypeStep({ value, onChange }: ServiceTypeStepProps) {
  const [selectedSampleService, setSelectedSampleService] = useState<
    string | null
  >(null);

  const toggleService = (id: string, checked: boolean) => {
    if (checked) {
      onChange([id]);
    } else {
      onChange([]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Chỉnh sửa ảnh</h3>
          <span className="text-xs text-muted-foreground">Photo Editing</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              label={service.label}
              subtitle={service.subtitle}
              checked={value.includes(service.id)}
              onChange={toggleService}
              samplesAvailable={service.samplesAvailable}
              onViewSamples={setSelectedSampleService}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Chỉnh sửa video</h3>
          <span className="text-xs text-muted-foreground">Video Editing</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEO_SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              label={service.label}
              subtitle={service.subtitle}
              checked={value.includes(service.id)}
              onChange={toggleService}
            />
          ))}
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {value.length}
          </span>
          <span>dịch vụ đã chọn</span>
        </div>
      )}

      <ServiceSampleDialog
        serviceId={selectedSampleService}
        open={selectedSampleService !== null}
        onClose={() => setSelectedSampleService(null)}
      />
    </div>
  );
}
