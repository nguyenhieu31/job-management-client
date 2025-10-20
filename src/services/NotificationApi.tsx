import type { Notification, NotificationResponse } from "@/types/notifications";
import { ApiResponse } from "@/components/types/ApiResponse";
import { PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";

// Mock notifications database (in real app, this would be on backend)
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "JOB_DONE",
    title: "Công việc hoàn thành",
    message: "Nhân viên Nguyễn Văn A vừa hoàn thành công việc JOB-001",
    jobCode: "JOB-001",
    senderName: "Nhân viên Nguyễn Văn A",
    senderEmail: "employee1@example.com",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString() as unknown as Date, // 5 minutes ago
  },
  {
    id: 2,
    type: "REVIEW_SUBMITTED",
    title: "Review hoàn thành",
    message: "QA Trần Thị B vừa submit review cho công việc JOB-001",
    jobCode: "JOB-001",
    senderName: "QA Trần Thị B",
    senderEmail: "qa1@example.com",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString() as unknown as Date,
  },
  {
    id: 3,
    type: "JOB_ASSIGNED",
    title: "Công việc được giao",
    message: "Bạn được giao công việc JOB-002 từ khách hàng ABC Company",
    jobCode: "JOB-002",
    senderName: "Hệ thống",
    senderEmail: "system@example.com",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString() as unknown as Date,
  },
];

// API: Get all notifications with pagination (GET /admin/notifications)
export const getAllNotifications = async (data: { pageNumber: number; pageSize: number }) => {
  try {
    const res = await axiosInstance.get(`/admin/notifications`, { params: { pageNumber: data.pageNumber, pageSize: data.pageSize } });
    return res as unknown as ApiResponse<PageResponse<Notification[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Create notification (POST /admin/notifications/create)
export const createNotification = async (data: Omit<Notification, "id" | "createdAt">) => {
  try {
    // In real app: const res = await axiosInstance.post(`/admin/notifications/create`, data);
    
    // Mock: add notification
    const newNotification: Notification = {
      ...data,
      id: Math.max(...mockNotifications.map((n) => n.id), 0) + 1,
      createdAt: new Date().toISOString() as unknown as Date,
    };
    mockNotifications.unshift(newNotification);

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: newNotification } as unknown as ApiResponse<Notification>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Delete notification (DELETE /admin/notifications/{id})
export const deleteNotification = async (notificationId: number) => {
  try {
    const res = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
    return res as unknown as ApiResponse<void>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Mark notification as read (PUT /admin/notifications/{id}/read)
export const readNotificationByIdAndAccountId = async (notificationId: number) => {
  try {
    const res = await axiosInstance.put(`/admin/notifications/${notificationId}/read`);
    return res as unknown as ApiResponse<Notification>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Mark all notifications as read (PUT /admin/notifications/read-all)
export const readAllNotificationsByIdsAndAccountId = async (ids: number[]) => {
  try {
    const res = await axiosInstance.put(`/admin/notifications/read-all`, { ids });
    return res as unknown as ApiResponse<void>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Helper: Get notifications (for backward compatibility)
export const getNotifications = async (page: number = 0, size: number = 10) => {
  try {
    const res = await getAllNotifications({ pageNumber: page, pageSize: size });
    return res.data as unknown as NotificationResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Helper: Mark as read (for backward compatibility)
export const markAsRead = async (notificationId: number) => {
  try {
    const res = await readNotificationByIdAndAccountId(notificationId);
    return res.data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Helper: Mark all as read (for backward compatibility)
export const markAllAsRead = async () => {
  try {
    const allIds = mockNotifications.map((n) => n.id);
    await readAllNotificationsByIdsAndAccountId(allIds);
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Helper: Add notification (called when job actions happen)
export const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
  const newNotification: Notification = {
    ...notification,
    id: Math.max(...mockNotifications.map((n) => n.id), 0) + 1,
    createdAt: new Date().toISOString() as unknown as Date,
  };
  mockNotifications.unshift(newNotification);
  return newNotification;
};

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  "JOB_DONE": {
    title: "Công việc hoàn thành",
    getMessage: (employeeName: string, jobCode: string) =>
      `${employeeName} vừa hoàn thành công việc ${jobCode}`,
  },
  "REVIEW_SUBMITTED": {
    title: "Review hoàn thành",
    getMessage: (qaName: string, jobCode: string) =>
      `${qaName} vừa submit review cho công việc ${jobCode}`,
  },
  "JOB_ASSIGNED": {
    title: "Công việc được giao",
    getMessage: (jobCode: string, customerName: string) =>
      `Bạn được giao công việc ${jobCode} từ khách hàng ${customerName}`,
  },
  "REVIEW_ASSIGNED": {
    title: "Yêu cầu review công việc",
    getMessage: (employeeName: string, jobCode: string) =>
      `Công việc ${jobCode} của ${employeeName} đang chờ review`,
  },
};
