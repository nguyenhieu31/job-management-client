"use client";

import { useCallback, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import {
  PHOTO_SERVICES,
  VIDEO_SERVICES,
  getServiceSampleImages,
  type ServiceOption,
} from "@/types/services";

function getServiceLabel(serviceId: string): string {
  const service = ([...PHOTO_SERVICES, ...VIDEO_SERVICES] as ServiceOption[]).find(
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
  const samples = serviceId ? getServiceSampleImages(serviceId) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const currentPair = samples[currentIndex] ?? null;
  const isVideo = !!currentPair?.video;
  const label = serviceId ? getServiceLabel(serviceId) : "";
  const hasMultiple = samples.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
    setVideoLoading(false);
  }, [serviceId]);

  const handleClose = useCallback(() => {
    setCurrentIndex(0);
    onClose();
  }, [onClose]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(samples.length - 1, i + 1));
  }, [samples.length]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{label || (isVideo ? "Sample Video" : "Sample Image")}</DialogTitle>
          <DialogDescription>
            {isVideo ? "Sample video for this service" : "Compare the results before and after editing"}
            {hasMultiple && ` (${currentIndex + 1}/${samples.length})`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {!currentPair ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Monitor className="h-12 w-12" />
              <p className="text-sm">There are no templates available for this service.</p>
            </div>
          ) : (
            <>
              {isVideo ? (
                <div className="relative w-full overflow-hidden rounded-lg border bg-black">
                  {videoLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-xs text-white/80">Loading video...</span>
                    </div>
                  )}
                  <video
                    key={`${serviceId}-${currentIndex}`}
                    src={currentPair.video}
                    controls
                    className="w-full aspect-video"
                    poster={currentPair.before}
                    autoPlay
                    onLoadStart={() => setVideoLoading(true)}
                    onLoadedData={() => setVideoLoading(false)}
                    onCanPlay={() => setVideoLoading(false)}
                    onWaiting={() => setVideoLoading(true)}
                    onPlaying={() => setVideoLoading(false)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="w-full overflow-hidden rounded-lg border">
                  <BeforeAfterSlider
                    key={`${serviceId}-${currentIndex}`}
                    beforeSrc={currentPair.before ?? ""}
                    afterSrc={currentPair.after ?? ""}
                    alt={label}
                  />
                </div>
              )}

              {hasMultiple && (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {currentIndex + 1} / {samples.length}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goNext}
                    disabled={currentIndex === samples.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
