"use client";

import type { ReactNode } from "react";

interface ConditionalSectionProps {
  show: boolean;
  children: ReactNode;
}

export function ConditionalSection({ show, children }: ConditionalSectionProps) {
  if (!show) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      {children}
    </div>
  );
}
