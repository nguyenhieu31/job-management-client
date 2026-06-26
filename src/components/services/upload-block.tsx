"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";
import { UPLOAD_METHOD_OPTIONS } from "@/types/services";

interface UploadBlockProps {
  value: string[];
  onChange: (methods: string[]) => void;
  dropboxLink: string;
  googleDriveLink: string;
  wetransferLink: string;
  onLinkChange: (field: "dropboxLink" | "googleDriveLink" | "wetransferLink", value: string) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  error?: string;
}

export function UploadBlock({
  value,
  onChange,
  dropboxLink,
  googleDriveLink,
  wetransferLink,
  onLinkChange,
  files,
  onFilesChange,
  error,
}: UploadBlockProps) {
  const toggleMethod = (methodId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, methodId]);
    } else {
      onChange(value.filter((v) => v !== methodId));
    }
  };

  return (
    <div className="space-y-3">
      <Label>Tải lên tệp</Label>
      <div className="grid gap-2">
        {UPLOAD_METHOD_OPTIONS.map((option) => (
          <div key={option.value} className="space-y-2">
            <label
              htmlFor={`upload-${option.value}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                value.includes(option.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30",
              )}
            >
              <Checkbox
                id={`upload-${option.value}`}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) =>
                  toggleMethod(option.value, checked === true)
                }
              />
              <span className="text-sm">{option.label}</span>
            </label>

            {value.includes(option.value) && option.value === "dropbox" && (
              <div className="pl-8">
                <Input
                  placeholder="Paste Dropbox link here..."
                  value={dropboxLink}
                  onChange={(e) => onLinkChange("dropboxLink", e.target.value)}
                />
              </div>
            )}

            {value.includes(option.value) && option.value === "google-drive" && (
              <div className="pl-8">
                <Input
                  placeholder="Paste Google Drive link here..."
                  value={googleDriveLink}
                  onChange={(e) => onLinkChange("googleDriveLink", e.target.value)}
                />
              </div>
            )}

            {value.includes(option.value) && option.value === "wetransfer" && (
              <div className="pl-8">
                <Input
                  placeholder="Paste WeTransfer link here..."
                  value={wetransferLink}
                  onChange={(e) => onLinkChange("wetransferLink", e.target.value)}
                />
              </div>
            )}

            {value.includes(option.value) && option.value === "direct-upload" && (
              <div className="pl-8">
                <FileUpload
                  value={files}
                  onChange={onFilesChange}
                  maxFiles={20}
                  maxSizeMB={100}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
