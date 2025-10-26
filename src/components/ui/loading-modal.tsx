import { useEffect } from "react";
import styles from "@/styles/loader.module.scss";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export function LoadingModal({ isOpen, message = "Đang tải..." }: LoadingModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative flex flex-col items-center justify-center gap-4">
        {/* Loader */}
        <div className={`text-primary ${styles.loader}`} />

        {/* Message */}
        {message && (
          <p className="text-white font-semibold text-lg drop-shadow-lg">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
