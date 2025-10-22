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
import type { UserRole } from "@/types/jobs";
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
} from "lucide-react";

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
  PARTIAL:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PARTIAL: "Thanh toán một phần",
  PAID: "Đã thanh toán",
};

export function JobDetailDialog({
  open,
  onOpenChange,
  job,
}: JobDetailDialogProps) {
  const { roleName } = useAppSelector((state) => state.authenticate);
  
  // Map role to UserRole type
  const getUserRole = (): UserRole => {
    const role = roleName?.toLowerCase();
    if (role === "manager" || role === "admin") return "manager";
    if (role === "qa") return "qa";
    return "employee";
  };

  const userRole = getUserRole();
  
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: "50%" }}
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
            {userRole === "manager" && (
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

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Số Điện Thoại
                    </label>
                    <p className="font-medium">{job.customer.phone}</p>
                  </div>

                  {job.customer.company && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Công Ty
                      </label>
                      <p className="font-medium">{job.customer.company}</p>
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
                        {job.workRequest.detailedNotes}
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

                {/* Right Column - Notes */}
                <div className="space-y-4 min-w-0">
                  {job.note && (
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-lg">Ghi Chú</h3>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg break-words overflow-wrap-break-word max-w-full">
                        {job.note}
                      </p>
                    </div>
                  )}

                  {job.qaNote && (
                    <div className="space-y-2 min-w-0">
                      <h3 className="font-semibold text-lg">Ghi Chú QA</h3>
                      <p className="text-sm whitespace-pre-wrap bg-red-500/10 p-4 rounded-lg border border-red-500/20 break-words overflow-wrap-break-word max-w-full">
                        {job.qaNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
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
                    Số Lượng File
                  </label>
                  <p className="text-2xl font-bold">{job.fileCount}</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <label className="text-sm text-muted-foreground block mb-1">
                  Tổng Giá
                </label>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(job.totalPrice)}
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
                    {formatCurrencyVND(job.totalPayPerFile)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

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
                  <p className="font-medium">{job.assignee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.assignee.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.assignee.phoneNumber}
                  </p>
                </div>
              ) : null}

              {/* Show QA info only for Manager and QA */}
              {userRole === "manager" || userRole === "qa" ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label className="text-sm text-muted-foreground block mb-2">
                    QA
                  </label>
                  <p className="font-medium">{job.qualifiedAssignee.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.qualifiedAssignee.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.qualifiedAssignee.phoneNumber}
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
