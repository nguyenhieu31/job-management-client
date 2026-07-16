"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Loader2, ImageIcon } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const loadedImages = useRef<Set<string>>(new Set());

  const samples = serviceId ? getServiceSampleImages(serviceId) : [];
  const currentPair = samples[0] ?? null;
  const alt =
    serviceId && SERVICE_SAMPLE_ALT[serviceId]
      ? SERVICE_SAMPLE_ALT[serviceId]
      : null;
  const label = serviceId ? getServiceLabel(serviceId) : "";

  const currentSrc =
    currentPair && view === "before" ? currentPair.before : currentPair?.after;

  const handleClose = useCallback(() => {
    setView("before");
    setLoading(true);
    loadedImages.current = new Set();
    onClose();
  }, [onClose]);

  const handleLoad = useCallback(() => {
    if (currentSrc) {
      loadedImages.current.add(currentSrc);
    }
    setLoading(false);
  }, [currentSrc]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
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
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
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
                    className={cn(
                      "object-contain",
                      loading && "invisible",
                    )}
                    onLoad={handleLoad}
                    onError={handleLoad}
                    priority
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setView("before");
                    if (!loadedImages.current.has(currentPair.before)) {
                      setLoading(true);
                    }
                  }}
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
                  onClick={() => {
                    setView("after");
                    if (!loadedImages.current.has(currentPair.after)) {
                      setLoading(true);
                    }
                  }}
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
