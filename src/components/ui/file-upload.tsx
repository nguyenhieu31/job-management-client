"use client";

import React, { useRef, useState, useCallback } from "react";
import { X, Upload, ImageIcon, Film, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  id?: number;
  file?: File;
  url: string;
  name: string;
  type: "image" | "video";
  size?: number;
}

interface FileUploadProps {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALL_ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");

function getFileType(file: File): "image" | "video" {
  if (IMAGE_TYPES.includes(file.type)) return "image";
  return "video";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  value = [],
  onChange,
  accept = ALL_ACCEPT,
  maxFiles = 20,
  maxSizeMB = 50,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: UploadedFile[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Check max files limit
        if (value.length + newFiles.length >= maxFiles) {
          alert(`Maximum ${maxFiles} file.`);
          break;
        }

        // Check file size
        if (file.size > maxSizeBytes) {
          alert(`File "${file.name}" exceeds ${maxSizeMB}MB.`);
          continue;
        }

        // Check file type
        const isImage = IMAGE_TYPES.includes(file.type);
        const isVideo = VIDEO_TYPES.includes(file.type);
        if (!isImage && !isVideo) {
          alert(`File "${file.name}" is not supported. Only images and videos are allowed.`);
          continue;
        }

        newFiles.push({
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          type: getFileType(file),
          size: file.size,
        });
      }

      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
      }
    },
    [value, onChange, maxFiles, maxSizeMB]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = [...value];
      const removed = newFiles.splice(index, 1)[0];
      // Revoke object URL to free memory
      if (removed.file) {
        URL.revokeObjectURL(removed.url);
      }
      onChange(newFiles);
    },
    [value, onChange]
  );

  const imageCount = value.filter((f) => f.type === "image").length;
  const videoCount = value.filter((f) => f.type === "video").length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // Reset so the same file can be selected again
          }}
          disabled={disabled}
        />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drag & drop or <span className="text-primary font-medium">click to select</span> images/videos
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported: JPG, PNG, GIF, WebP, MP4, WebM • Maximum {maxSizeMB}MB/file • {maxFiles} files
        </p>
      </div>

      {/* File count summary */}
      {value.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {imageCount > 0 && (
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" />
              {imageCount} images
            </span>
          )}
          {videoCount > 0 && (
            <span className="flex items-center gap-1">
              <Film className="h-3.5 w-3.5" />
              {videoCount} video
            </span>
          )}
          <span>• {value.length}/{maxFiles} files</span>
        </div>
      )}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative group rounded-lg overflow-hidden border bg-muted aspect-square"
            >
              {file.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/5">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                </div>
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(file);
                  }}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white text-black transition-colors"
                  title="Xem"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    title="Xóa"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* File type badge */}
              <div className="absolute top-1 left-1">
                {file.type === "video" ? (
                  <span className="bg-blue-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                    VIDEO
                  </span>
                ) : null}
              </div>

              {/* File name tooltip */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            {previewFile.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[85vh] mx-auto rounded-lg object-contain"
              />
            ) : (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] mx-auto rounded-lg"
              />
            )}
            <p className="text-center text-white text-sm mt-2">
              {previewFile.name}
              {previewFile.size && ` • ${formatFileSize(previewFile.size)}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
