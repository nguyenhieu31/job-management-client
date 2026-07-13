"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PHOTO_SERVICES,
  getServiceSampleImages,
  SERVICE_SAMPLE_ALT,
  type ServiceOption,
} from "@/types/services";

type ViewState = "before" | "after";

function getServiceLabel(serviceId: string): string {
  const service = (PHOTO_SERVICES as ServiceOption[]).find(
    (s) => s.id === serviceId,
  );
  return service?.label ?? serviceId;
}

interface ServiceSampleDialogProps {
  serviceId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ServiceSampleDialog({
  serviceId,
  open,
  onClose,
}: ServiceSampleDialogProps) {
  const [view, setView] = useState<ViewState>("before");

  const samples = serviceId ? getServiceSampleImages(serviceId) : [];
  const currentPair = samples[0] ?? null;
  const alt =
    serviceId && SERVICE_SAMPLE_ALT[serviceId]
      ? SERVICE_SAMPLE_ALT[serviceId]
      : null;
  const label = serviceId ? getServiceLabel(serviceId) : "";

  const currentSrc =
    currentPair && view === "before" ? currentPair.before : currentPair?.after;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{label || "Ảnh mẫu"}</DialogTitle>
          <DialogDescription>
            So sánh kết quả trước và sau khi chỉnh sửa
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {!currentPair ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <p className="text-sm">Chưa có ảnh mẫu cho dịch vụ này</p>
            </div>
          ) : (
            <>
              <div className="relative w-full overflow-hidden rounded-lg border bg-muted/30">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={currentSrc}
                    alt={
                      alt
                        ? view === "before"
                          ? alt.before
                          : alt.after
                        : `${view === "before" ? "Trước" : "Sau"} khi chỉnh sửa - ${label}`
                    }
                    fill
                    sizes="(max-width: 600px) 100vw, 600px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView("before")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    view === "before"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setView("after")}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                    view === "after"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  Sau
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
