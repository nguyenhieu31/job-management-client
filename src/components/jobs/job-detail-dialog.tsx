"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobResponse } from "@/types/jobs";
import type { UserRole, FileStorage } from "@/types/jobs";
import { formatCurrency, formatCurrencyVND, formatDate } from "@/lib/utils";
import { useAppSelector } from "@/store/store";
import {
  ExternalLink,
  User,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  ImageIcon,
  Film,
  Eye,
  X,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface JobDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobResponse | null;
}

const jobStatusColors: Record<string, string> = {
  PENDING:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  IN_PROGRESS:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  DONE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  IN_REVIEW:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  REVIEWED:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

const jobStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ",
  IN_PROGRESS: "Đang tiến hành",
  DONE: "Đã hoàn thành",
  IN_REVIEW: "Đang xem xét",
  REVIEWED: "Đã được xem xét",
  COMPLETED: "Đã hoàn tất",
};

const paymentStatusColors = {
  UNPAID: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  INVOICE_SENT:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  INVOICE_DRAFT: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  NOT_PAYABLE: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  INVOICE_SENT: "Đã gửi hóa đơn",
  PAID: "Đã thanh toán",
  INVOICE_DRAFT: "Đã tạo hóa đơn",
  CANCELLED: "Đã hủy",
  NOT_PAYABLE: "KHÔNG THANH TOÁN",
};

export function JobDetailDialog({
  open,
  onOpenChange,
  job,
}: JobDetailDialogProps) {
  const { roleName } = useAppSelector((state) => state.authenticate);
  const [previewMedia, setPreviewMedia] = useState<FileStorage | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRichContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const src = (target as HTMLImageElement).src;
      if (src) {
        setPreviewMedia({
          id: Date.now(),
          dropboxLink: src,
          folderPath: "Xem ảnh minh họa",
          isImage: true,
          fileType: "IMAGE",
        } as any);
      }
    }
  };
  
  // Map role to UserRole type
  const getUserRole = (): UserRole => {
    const role = roleName?.toLowerCase();
    if (role === "manager" || role === "admin") return "manager";
    if (role === "qa") return "qa";
    if (role === "saler") return "saler";
    return "employee";
  };

  // For HTML content (used with dangerouslySetInnerHTML) - returns string
  const renderHtmlWithLinks = (html: string): string => {
    if (!html) return "";
    
    // Split by ALL HTML tags to avoid corrupting URLs inside tag attributes (src, href, etc.)
    const htmlTagRegex = /(<[^>]+>)/g;
    const segments = html.split(htmlTagRegex);
    
    let insideAnchor = false;
    
    return segments.map(segment => {
      // If it's an HTML tag, keep as-is and track <a> open/close
      if (/^<[^>]+>$/.test(segment)) {
        if (/^<a\s/i.test(segment)) insideAnchor = true;
        if (/^<\/a>/i.test(segment)) insideAnchor = false;
        return segment;
      }
      // Only convert URLs in text content outside of <a> tags
      if (insideAnchor) return segment;
      return segment.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">$1</a>'
      );
    }).join('');
  };

  // For plain text / mixed content (returns JSX elements)
  const renderTextWithLinks = (text: string) => {
    if (!text) return "";
    
    // Split by ALL HTML tags to avoid corrupting URLs inside tag attributes (src, href, etc.)
    const htmlTagRegex = /(<[^>]+>)/g;
    const segments = text.split(htmlTagRegex);
    
    let insideAnchor = false;
    
    return segments.map((segment, segIndex) => {
      // If it's an HTML tag, render as-is and track <a> open/close
      if (/^<[^>]+>$/.test(segment)) {
        if (/^<a\s/i.test(segment)) insideAnchor = true;
        if (/^<\/a>/i.test(segment)) insideAnchor = false;
        return <span key={segIndex} dangerouslySetInnerHTML={{ __html: segment }} />;
      }
      // Text inside <a> tags - render as-is without converting URLs
      if (insideAnchor) {
        return <Fragment key={segIndex}>{segment}</Fragment>;
      }
      
      // Convert standalone URLs in text content
      const urlRegex = /(https?:\/\/[^\s<]+)/g;
      const parts = segment.split(urlRegex);
      
      return parts.map((part, partIndex) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={`${segIndex}-${partIndex}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <Fragment key={`${segIndex}-${partIndex}`}>{part}</Fragment>;
      });
    });
  };

  const userRole = getUserRole();
  
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      // Nếu đang có preview và user muốn đóng dialog  
      if (!value && previewMedia) {
        // Chỉ đóng preview, không đóng dialog
        setPreviewMedia(null);
        return;
      }
      // Nếu không có preview, đóng dialog bình thường
      onOpenChange(value);
    }}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: "60%" }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Chi Tiết Công Việc #{job.code}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về công việc và trạng thái hiện tại
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Badges */}
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className={jobStatusColors[job.jobStatus]}>
              {jobStatusLabels[job.jobStatus]}
            </Badge>
            {userRole === "manager" && (
              <Badge
                variant="outline"
                className={paymentStatusColors[job.paymentStatus]}
              >
                {paymentStatusLabels[job.paymentStatus]}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông Tin Cơ Bản
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Tên Job
                  </label>
                  <p className="font-medium">{job.caseName}</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày Tạo
                  </label>
                  <p className="font-medium">
                    {formatDate(job.createdAt.toString())}
                  </p>
                </div>

                {/* <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày Cập Nhật
                  </label>
                  <p className="font-medium">
                    {formatDate(job.updatedAt.toString())}
                  </p>
                </div> */}
              </div>
            </div>

            {/* Customer Information - Hidden for Employee & QA */}
            {(userRole === "manager" || userRole === "saler") && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thông Tin Khách Hàng
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Tên Khách Hàng
                    </label>
                    <p className="font-medium">{job.customer.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{job.customer.email}</p>
                  </div>

                  {/* {job.customer.company && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Công Ty
                      </label>
                      <p className="font-medium">{job.customer.company}</p>
                    </div>
                  )} */}

                  {job.assignedSale && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Sale phụ trách
                      </label>
                      <p className="font-medium">{job.assignedSale.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Work Request Information */}
          {job.workRequest && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Work Request Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Style hàng
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Danh Mục
                      </label>
                      <p className="font-medium">
                        {job.workRequest.categoryName}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">
                        Loại File
                      </label>
                      <Badge variant="outline">{job.workRequest.fileType}</Badge>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">
                        Tóm Tắt
                      </label>
                      <p className="text-sm">{job.workRequest.summaryNote}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">
                        Hướng Dẫn Chi Tiết
                      </label>
                      <p className="text-sm whitespace-pre-wrap">
                        {renderTextWithLinks(job.workRequest.detailedNotes)}
                      </p>
                    </div>

                    {job.workRequest.colorNote && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Ghi Chú Màu Sắc
                        </label>
                        <p className="text-sm">{job.workRequest.colorNote}</p>
                      </div>
                    )}

                    {job.workRequest.linkSample && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Link Mẫu
                        </label>
                        <a
                          href={job.workRequest.linkSample}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Xem mẫu
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Notes & Media */}
                <div className="space-y-4 min-w-0">
                  {job.note && (
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-lg">Ghi Chú</h3>
                      <div
                        className="rich-note-content text-sm bg-muted/50 p-4 rounded-lg break-words overflow-wrap-break-word max-w-full cursor-pointer"
                        onClick={handleRichContentClick}
                        dangerouslySetInnerHTML={{ __html: renderHtmlWithLinks(job.note) }}
                      />
                    </div>
                  )}

                  {job.qaNote && (
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">Ghi Chú QA</h3>
                      <div
                        className="rich-note-content text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20 break-words overflow-wrap-break-word max-w-full cursor-pointer"
                        onClick={handleRichContentClick}
                        dangerouslySetInnerHTML={{ __html: renderHtmlWithLinks(job.qaNote) }}
                      />
                    </div>
                  )}

                  {/* Media Gallery - Images & Videos from fileStorages */}
                  {job.fileStorages && job.fileStorages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Ảnh & Video đính kèm
                      </h3>

                      {/* Summary */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {job.fileStorages.filter(f => f.isImage).length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-4 w-4" />
                            {job.fileStorages.filter(f => f.isImage).length} ảnh
                          </span>
                        )}
                        {job.fileStorages.filter(f => !f.isImage).length > 0 && (
                          <span className="flex items-center gap-1">
                            <Film className="h-4 w-4" />
                            {job.fileStorages.filter(f => !f.isImage).length} video
                          </span>
                        )}
                      </div>

                      {/* Images Grid */}
                      {job.fileStorages.filter(f => f.isImage).length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Ảnh</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {job.fileStorages.filter(f => f.isImage).map((file) => (
                              <div
                                key={file.id}
                                className="relative group rounded-lg overflow-hidden border bg-muted aspect-square cursor-pointer"
                                onClick={() => setPreviewMedia(file)}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={file.dropboxLink}
                                  alt={file.folderPath}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos Grid */}
                      {job.fileStorages.filter(f => !f.isImage).length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Video</label>
                          <div className="grid grid-cols-2 gap-3">
                            {job.fileStorages.filter(f => !f.isImage).map((file) => (
                              <div
                                key={file.id}
                                className="relative group rounded-lg overflow-hidden border bg-black aspect-video cursor-pointer"
                                onClick={() => setPreviewMedia(file)}
                              >
                                <video
                                  src={file.dropboxLink}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute top-1 left-1">
                                  <span className="bg-blue-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    VIDEO
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Preview Modal - rendered via portal to escape dialog constraints */}
          {previewMedia && mounted && createPortal(
            <div
              className="fixed inset-0 bg-black/95 flex items-center justify-center p-2"
              style={{ zIndex: 99999 }}
              onClick={() => setPreviewMedia(null)}
            >
              <div
                className="relative w-[96vw] h-[96vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="absolute top-2 right-2 z-10 p-2 text-white hover:text-gray-300 transition-colors bg-black/60 rounded-full"
                >
                  <X className="h-7 w-7" />
                </button>
                {previewMedia.isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewMedia.dropboxLink}
                    alt={previewMedia.folderPath}
                    className="max-w-[96vw] max-h-[96vh] mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <video
                    src={previewMedia.dropboxLink}
                    controls
                    autoPlay
                    className="max-w-[96vw] max-h-[96vh] mx-auto rounded-lg"
                  />
                )}
              </div>
            </div>,
            document.body
          )}

          {/* File & Price Information - Hidden for Employee & QA */}
          {userRole === "manager" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông Tin File & Giá
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Số Lượng Input
                  </label>
                  <p className="text-2xl font-bold">{job.inputNumber}</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Số Lượng Output
                  </label>
                  <p className="text-2xl font-bold">{job.outputNumber}</p>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Số Lượng Output Qa
                  </label>
                  <p className="text-2xl font-bold">{job.qaOutputNumber}</p>
                </div>

                {/* <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-1">
                    Số Lượng File
                  </label>
                  <p className="text-2xl font-bold">{job.fileCount}</p>
                </div> */}
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <label className="text-sm text-muted-foreground block mb-1">
                  Tổng Giá
                </label>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(job.filePrice * job.outputNumber)}
                </p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Liên Kết
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Link Input
                </label>
                {job.inputLink ? (
                  <a
                    href={job.inputLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {job.inputLink}
                  </a>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Link Hoàn Thành
                </label>
                {job.doneLink ? (
                  <a
                    href={job.doneLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline break-all"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {job.doneLink}
                  </a>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Employee Payment Information - Visible to Employee and Manager */}
          {(userRole === "employee" || userRole === "manager") && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông Tin Thanh Toán Nhân Viên
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Trả/File
                  </label>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrencyVND(job.payPerFile)}
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Tổng Tiền Trả
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrencyVND(job.payPerFile * job.outputNumber)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />
          {(userRole === "qa" || userRole === "manager") && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông Tin Thanh Toán Nhân Viên QA
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Trả/File
                  </label>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrencyVND(job.payPerFileQa)}
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Tổng Tiền Trả
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrencyVND(job.payPerFileQa * job.qaOutputNumber)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <Separator />

          {/* Assignment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Phân Công
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Show Employee info for Manager, QA, and Employee (to see their own info) */}
              {userRole === "manager" || userRole === "qa" || userRole === "employee" ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-2">
                    Người Được Giao
                  </label>
                  <p className="font-medium">{job.assignee && job.assignee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.assignee && job.assignee.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.assignee && job.assignee.phoneNumber}
                  </p>
                </div>
              ) : null}

              {/* Show QA info only for Manager and QA */}
              {userRole === "manager" || userRole === "qa" ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-2">
                    QA
                  </label>
                  <p className="font-medium">{job.qualifiedAssignee && job.qualifiedAssignee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.qualifiedAssignee && job.qualifiedAssignee.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.qualifiedAssignee && job.qualifiedAssignee.phoneNumber}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
