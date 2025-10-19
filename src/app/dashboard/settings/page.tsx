"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader as LoaderIcon, Save, RotateCcw, FolderOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { FetchSettingsAction, UpdateSettingsAction } from "@/store/slice/settings/Settings";
import { toast } from "react-toastify";
import Loader from "@/components/ui/loader";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { settings, loading, saving, error } = useAppSelector((state) => state.settings);
  
  const [folderPath, setFolderPath] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    dispatch(FetchSettingsAction());
  }, [dispatch]);

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFolderPath(settings.folderPath);
      setHasChanges(false);
    }
  }, [settings]);

  const handleFolderPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value;
    setFolderPath(newPath);
    setHasChanges(newPath !== settings?.folderPath);
  };

  const handleSave = async () => {
    if (!folderPath.trim()) {
      toast.error("Vui lòng nhập đường dẫn thư mục");
      return;
    }

    try {
      await dispatch(UpdateSettingsAction({ folderPath }));
      setHasChanges(false);
      toast.success("Cấu hình đã được lưu thành công");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi lưu cấu hình");
    }
  };

  const handleReset = () => {
    if (settings) {
      setFolderPath(settings.folderPath);
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <Loader width={40} height={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen className="w-8 h-8" />
            Cấu Hình Thư Mục
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý đường dẫn thư mục và các cài đặt lưu trữ
          </p>
        </div>

        {/* Settings Card */}
        <Card className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Folder Path Input */}
          <div className="space-y-3">
            <Label htmlFor="folderPath" className="text-base font-semibold">
              Đường Dẫn Thư Mục
            </Label>
            <p className="text-sm text-muted-foreground">
              Chỉ định thư mục nơi các công việc và file sẽ được lưu trữ
            </p>
            <Input
              id="folderPath"
              value={folderPath}
              onChange={handleFolderPathChange}
              placeholder="/home/user/jobs"
              className="text-base font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ví dụ: /home/user/jobs, /mnt/storage/projects, hoặc C:\Users\Documents\Jobs
            </p>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-blue-900">ℹ️ Thông Tin Thêm</p>
            {settings && (
              <>
                <p className="text-sm text-blue-800">
                  <strong>Cấu hình hiện tại:</strong> {settings.folderPath}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Kích thước tệp tối đa:</strong> {settings.maxFileSize} MB
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Loại tệp cho phép:</strong> {settings.allowedFileTypes.join(", ")}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Cập nhật lần cuối:</strong> {new Date(settings.updatedAt).toLocaleString("vi-VN")} bởi {settings.updatedBy}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              size="lg"
              className="gap-2"
            >
              {saving ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu Cấu Hình
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              disabled={!hasChanges || saving}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Hủy
            </Button>
          </div>
        </Card>

        {/* Additional Settings */}
        <Card className="p-6 mt-6 space-y-6 bg-muted/20">
          <div>
            <h3 className="text-lg font-semibold mb-4">Cài Đặt Nâng Cao</h3>
            
            {/* Max File Size */}
            <div className="space-y-3 mb-6">
              <Label className="text-base font-semibold">
                Kích Thước Tệp Tối Đa (MB)
              </Label>
              <p className="text-sm text-muted-foreground">
                Giới hạn kích thước file có thể tải lên
              </p>
              <Input
                type="number"
                value={settings?.maxFileSize || 500}
                disabled
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                (Hiện tại: {settings?.maxFileSize} MB - Liên hệ quản trị viên để thay đổi)
              </p>
            </div>

            {/* Allowed File Types */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Loại Tệp Cho Phép
              </Label>
              <p className="text-sm text-muted-foreground">
                Các định dạng file được phép tải lên
              </p>
              <div className="flex flex-wrap gap-2">
                {settings?.allowedFileTypes.map((type: string) => (
                  <div
                    key={type}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    .{type}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                (Hiện tại: {settings?.allowedFileTypes.join(", ")} - Liên hệ quản trị viên để thay đổi)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
