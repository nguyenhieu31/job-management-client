"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCheck, Check } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAppDispatch } from "@/store/store";
import {
  MarkAsReadAction,
  MarkAllAsReadAction,
  DeleteNotificationAction,
} from "@/store/slice/notification/Notification";
import { toast } from "react-toastify";
import Loader from "@/components/ui/loader";
import Link from "next/link";
import type { Notification } from "@/types/notifications";

const NOTIFICATION_COLORS = {
  job_done: "bg-blue-50 border-blue-200",
  review_submitted: "bg-green-50 border-green-200",
  job_assigned: "bg-purple-50 border-purple-200",
  review_assigned: "bg-orange-50 border-orange-200",
};

const NOTIFICATION_BADGE_COLORS = {
  job_done: "bg-blue-100 text-blue-800",
  review_submitted: "bg-green-100 text-green-800",
  job_assigned: "bg-purple-100 text-purple-800",
  review_assigned: "bg-orange-100 text-orange-800",
};

const NOTIFICATION_LABELS = {
  job_done: "Công việc hoàn thành",
  review_submitted: "Review hoàn thành",
  job_assigned: "Giao công việc",
  review_assigned: "Chờ review",
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useNotifications(15000);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [marking, setMarking] = useState<number | null>(null);

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
      await dispatch(MarkAllAsReadAction());
      toast.success("Đánh dấu tất cả đã đọc");
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

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

        {loading ? (
          <Loader width={40} height={40} />
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Không có thông báo nào</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: Notification) => (
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
        )}
      </div>
    </div>
  );
}
