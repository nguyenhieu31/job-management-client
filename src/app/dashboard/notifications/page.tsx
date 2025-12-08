"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCheck, Check, ArrowDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  MarkAsReadAction,
  MarkAllAsReadAction,
  DeleteNotificationAction,
  FetchNotificationsAction,
} from "@/store/slice/notification/Notification";
import { toast } from "react-toastify";
import Loader from "@/components/ui/loader";
import Link from "next/link";
import type { Notification } from "@/types/notifications";
import { PageResponse } from "@/components/types/Page";

const NOTIFICATION_COLORS = {
  "JOB_DONE": "bg-blue-50 border-blue-200",
  "REVIEW_SUBMITTED": "bg-green-50 border-green-200",
  "JOB_REJECTED": "bg-red-50 border-red-200",
  "JOB_ASSIGNED": "bg-purple-50 border-purple-200",
  "REVIEW_ASSIGNED": "bg-orange-50 border-orange-200",
};

const NOTIFICATION_BADGE_COLORS = {
  "JOB_DONE": "bg-blue-100 text-blue-800",
  "REVIEW_SUBMITTED": "bg-green-100 text-green-800",
  "JOB_ASSIGNED": "bg-purple-100 text-purple-800",
  "REVIEW_ASSIGNED": "bg-orange-100 text-orange-800",
  "JOB_REJECTED": "bg-red-100 text-red-800",
};

const NOTIFICATION_LABELS = {
  "JOB_DONE": "Công việc hoàn thành",
  "REVIEW_SUBMITTED": "Review hoàn thành",
  "JOB_ASSIGNED": "Giao công việc",
  "REVIEW_ASSIGNED": "Chờ review",
  "JOB_REJECTED": "Công việc bị từ chối"
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, loading, unreadCount } : {notifications: PageResponse<Notification[]> | undefined, loading: boolean, unreadCount: number} = useAppSelector((state) => state.notification);
  
  const [deleting, setDeleting] = useState<number | null>(null);
  const [marking, setMarking] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleMarkAsRead = async (id: number) => {
    setMarking(id);
    try {
      await dispatch(MarkAsReadAction(id));
    } finally {
      setMarking(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications?.data
        .filter((n: Notification) => !n.isRead)
        .map((n: Notification) => n.id);
      if (unreadIds && unreadIds.length > 0) {
        await dispatch(MarkAllAsReadAction(unreadIds));
        toast.success("Đánh dấu tất cả đã đọc");
      } else {
        toast.info("Tất cả đã đọc");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đánh dấu");
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await dispatch(DeleteNotificationAction(id));
      toast.success("Xóa thông báo thành công");
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa");
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = notifications ? notifications.pageNumber + 1 : 0;
      await dispatch(FetchNotificationsAction({ page: nextPage, size: notifications?.pageSize }));
    } finally {
      setLoadingMore(false);
    }
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const hasMorePages = notifications ? notifications.pageNumber < notifications.totalPages - 1 : false;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Tất cả đã đọc"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>

        {loading && notifications && notifications.data.length === 0 ? (
          <Loader width={40} height={40} />
        ) : notifications && notifications.data.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Không có thông báo nào</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {notifications &&  notifications.data.map((notification: Notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 border-l-4 transition-all hover:shadow-md ${
                    NOTIFICATION_COLORS[notification.type]
                  } ${!notification.isRead ? "border-l-primary" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={NOTIFICATION_BADGE_COLORS[notification.type]}>
                          {NOTIFICATION_LABELS[notification.type]}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm mb-1">
                        {notification.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Từ: {notification.senderName}</span>
                        <span>{formatTime(notification.createdAt)}</span>

                        {notification.jobCode && (
                          <Link
                            href={`/dashboard/job`}
                            className="text-primary hover:underline font-medium"
                          >
                            Xem công việc →
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={marking === notification.id}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleting === notification.id}
                        className="text-destructive hover:text-destructive gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMorePages && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  <ArrowDown className="w-4 h-4" />
                  {loadingMore ? "Đang tải..." : "Tải thêm"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
