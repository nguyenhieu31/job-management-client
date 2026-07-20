"use client";

import { useRef, useState, useCallback } from "react";
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
  const draggingRef = useRef(false);
  const loading = !loaded.before || !loaded.after;

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
      className={cn("relative w-full overflow-hidden select-none", className)}
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
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* After image (bottom layer) */}
      <Image
        src={afterSrc}
        alt={alt ? `After - ${alt}` : "After"}
        fill
        className={cn("pointer-events-none object-cover", !loaded.after && "invisible")}
        draggable={false}
        onLoad={() => setLoaded((p) => ({ ...p, after: true }))}
      />

      {/* Before image (top layer, clipped) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={alt ? `Before - ${alt}` : "Before"}
          fill
          className={cn("pointer-events-none object-cover", !loaded.before && "invisible")}
          draggable={false}
          onLoad={() => setLoaded((p) => ({ ...p, before: true }))}
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
