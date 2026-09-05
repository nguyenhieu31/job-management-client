"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt = "",
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [loaded, setLoaded] = useState({ before: false, after: false });
  const [hasError, setHasError] = useState({ before: false, after: false });
  const draggingRef = useRef(false);

  // Reset loaded state whenever images change
  useEffect(() => {
    setLoaded({ before: false, after: false });
    setHasError({ before: false, after: false });
    setPosition(50);
  }, [beforeSrc, afterSrc]);

  const loading = (!loaded.before || !loaded.after) && (!hasError.before && !hasError.after);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden select-none bg-muted", className)}
      style={{ aspectRatio: "16 / 9" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="slider"
      aria-label="Before/after comparison"
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 2));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 2));
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading sample image...</span>
        </div>
      )}

      {/* Before / After labels */}
      <span className="absolute top-2.5 left-2.5 z-20 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm pointer-events-none">
        Before
      </span>
      <span className="absolute top-2.5 right-2.5 z-20 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm pointer-events-none">
        After
      </span>

      {/* After image (bottom layer) */}
      <Image
        key={`after-${afterSrc}`}
        src={afterSrc}
        alt={alt ? `After - ${alt}` : "After"}
        fill
        className={cn("pointer-events-none object-cover transition-opacity duration-200", !loaded.after ? "opacity-0" : "opacity-100")}
        draggable={false}
        onLoad={() => setLoaded((p) => ({ ...p, after: true }))}
        onError={() => {
          setLoaded((p) => ({ ...p, after: true }));
          setHasError((p) => ({ ...p, after: true }));
        }}
      />

      {/* Before image (top layer, clipped) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          key={`before-${beforeSrc}`}
          src={beforeSrc}
          alt={alt ? `Before - ${alt}` : "Before"}
          fill
          className={cn("pointer-events-none object-cover transition-opacity duration-200", !loaded.before ? "opacity-0" : "opacity-100")}
          draggable={false}
          onLoad={() => setLoaded((p) => ({ ...p, before: true }))}
          onError={() => {
            setLoaded((p) => ({ ...p, before: true }));
            setHasError((p) => ({ ...p, before: true }));
          }}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 z-20 w-0.5 bg-white pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      {/* Handle circle */}
      <div
        className="absolute z-30 grid place-items-center rounded-full border border-neutral-400 bg-white shadow-md pointer-events-none"
        style={{
          left: `${position}%`,
          top: "50%",
          width: 36,
          height: 36,
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-600"
        >
          <polyline points="15 18 9 12 15 6" />
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </div>
    </div>
  );
}
