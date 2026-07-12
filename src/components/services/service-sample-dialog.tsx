"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, ImageIcon } from "lucide-react";
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
type LoadState = "loading" | "loaded" | "error";

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
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const activeServiceId = useRef<string | null>(null);

  const samples = serviceId ? getServiceSampleImages(serviceId) : [];
  const currentPair = samples[0] ?? null;
  const alt =
    serviceId && SERVICE_SAMPLE_ALT[serviceId]
      ? SERVICE_SAMPLE_ALT[serviceId]
      : null;
  const label = serviceId ? getServiceLabel(serviceId) : "";

  useEffect(() => {
    if (open && serviceId) {
      activeServiceId.current = serviceId;
      setView("before");
      setLoadState(currentPair ? "loading" : "loaded");
    }
    if (!open) {
      activeServiceId.current = null;
    }
  }, [open, serviceId, currentPair]);

  const handleLoad = useCallback(() => {
    if (activeServiceId.current === serviceId) {
      setLoadState("loaded");
    }
  }, [serviceId]);

  const handleError = useCallback(() => {
    if (activeServiceId.current === serviceId) {
      setLoadState("error");
    }
  }, [serviceId]);

  const handleRetry = useCallback(() => {
    setLoadState("loading");
  }, []);

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
          ) : loadState === "error" ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm">Không thể tải ảnh mẫu</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="relative w-full overflow-hidden rounded-lg border bg-muted/30">
                <div className="relative aspect-[16/10] w-full">
                  {loadState === "loading" && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                      loadState === "loading" && "invisible",
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
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
