"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkRequestResponse } from "@/types/work-requests";

interface WorkRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (workRequest: Partial<WorkRequestResponse>) => void;
  editingWorkRequest: WorkRequestResponse | null;
}

export function WorkRequestForm({
  open,
  onOpenChange,
  onSubmit,
  editingWorkRequest,
}: WorkRequestFormProps) {
  const [formData, setFormData] = useState({
    categoryName: "",
    summaryNote: "",
    detailedNotes: "",
    linkSample: "",
    fileType: "",
    colorNote: "",
  });

  useEffect(() => {
    if (editingWorkRequest) {
      setFormData({
        categoryName: editingWorkRequest.categoryName,
        summaryNote: editingWorkRequest.summaryNote,
        detailedNotes: editingWorkRequest.detailedNotes,
        linkSample: editingWorkRequest.linkSample,
        fileType: editingWorkRequest.fileType,
        colorNote: editingWorkRequest.colorNote,
      });
    } else {
      setFormData({
        categoryName: "",
        summaryNote: "",
        detailedNotes: "",
        linkSample: "",
        fileType: "",
        colorNote: "",
      });
    }
  }, [editingWorkRequest, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const workRequest: Partial<WorkRequestResponse> = {
      ...(editingWorkRequest && { id: editingWorkRequest.id }),
      categoryName: formData.categoryName,
      summaryNote: formData.summaryNote,
      detailedNotes: formData.detailedNotes,
      linkSample: formData.linkSample,
      fileType: formData.fileType,
      colorNote: formData.colorNote,
    };

    onSubmit(workRequest);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingWorkRequest ? "Chỉnh Sửa Yêu Cầu" : "Thêm Yêu Cầu Mới"}
          </DialogTitle>
          <DialogDescription>
            {editingWorkRequest
              ? "Cập nhật thông tin yêu cầu công việc"
              : "Điền thông tin để tạo yêu cầu công việc mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="categoryName">Tên Danh Mục *</Label>
            <Input
              id="categoryName"
              value={formData.categoryName}
              onChange={(e) =>
                setFormData({ ...formData, categoryName: e.target.value })
              }
              placeholder="Ví dụ: Multi Exposure RKe"
              required
            />
          </div>

          {/* Summary Note */}
          <div className="space-y-2">
            <Label htmlFor="summaryNote">Tóm Tắt Yêu Cầu *</Label>
            <Input
              id="summaryNote"
              value={formData.summaryNote}
              onChange={(e) =>
                setFormData({ ...formData, summaryNote: e.target.value })
              }
              placeholder="Ví dụ: Sáng sạch đều màu (Fill đèn tivi)"
              required
            />
          </div>

          {/* Detailed Notes */}
          <div className="space-y-2">
            <Label htmlFor="detailedNotes">Hướng Dẫn Chi Tiết *</Label>
            <Textarea
              id="detailedNotes"
              value={formData.detailedNotes}
              onChange={(e) =>
                setFormData({ ...formData, detailedNotes: e.target.value })
              }
              placeholder="Nhập hướng dẫn chi tiết tại đây..."
              rows={6}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Có thể xuống dòng để định dạng tốt hơn
            </p>
          </div>

          {/* Link Sample */}
          <div className="space-y-2">
            <Label htmlFor="linkSample">Link Mẫu *</Label>
            <Input
              id="linkSample"
              type="url"
              value={formData.linkSample}
              onChange={(e) =>
                setFormData({ ...formData, linkSample: e.target.value })
              }
              placeholder="Ví dụ: https://byvn.net/1auK"
              required
            />
          </div>

          {/* File Type */}
          <div className="space-y-2">
            <Label htmlFor="fileType">Loại File *</Label>
            <Input
              id="fileType"
              value={formData.fileType}
              onChange={(e) =>
                setFormData({ ...formData, fileType: e.target.value })
              }
              placeholder="Ví dụ: TIFF"
              required
            />
          </div>

          {/* Color Note */}
          <div className="space-y-2">
            <Label htmlFor="colorNote">Ghi Chú Màu Sắc *</Label>
            <Textarea
              id="colorNote"
              value={formData.colorNote}
              onChange={(e) =>
                setFormData({ ...formData, colorNote: e.target.value })
              }
              placeholder="Ví dụ: Trừ trắng hay xám đều tăng 3 tem..."
              rows={3}
              required
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingWorkRequest ? "Cập Nhật" : "Tạo Mới"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
