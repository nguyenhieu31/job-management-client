import type { Notification, NotificationResponse } from "@/types/notifications";
import { ApiResponse } from "@/components/types/ApiResponse";
import { PageResponse } from "@/components/types/Page";

// Mock notifications database (in real app, this would be on backend)
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "job_done",
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
    type: "review_submitted",
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
    type: "job_assigned",
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
    // In real app: const res = await axiosInstance.get(`/admin/notifications`, { params: { pageNumber: data.pageNumber, pageSize: data.pageSize } });
    
    // Mock: simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotifications = mockNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = data.pageNumber * data.pageSize;
    const end = start + data.pageSize;
    const paginatedNotifications = allNotifications.slice(start, end);
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    const response: PageResponse<Notification[]> = {
      data: paginatedNotifications,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: allNotifications.length,
      totalPages: Math.ceil(allNotifications.length / data.pageSize),
    };

    return {
      data: response,
      unreadCount,
      count: allNotifications.length,
    } as unknown as ApiResponse<PageResponse<Notification[]> & { unreadCount: number }>;
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
    // In real app: const res = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
    
    // Mock: remove notification
    const index = mockNotifications.findIndex((n) => n.id === notificationId);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: null } as unknown as ApiResponse<null>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Mark notification as read (PUT /admin/notifications/{id}/read)
export const readNotificationByIdAndAccountId = async (notificationId: number) => {
  try {
    // In real app: const res = await axiosInstance.put(`/admin/notifications/${notificationId}/read`);
    
    // Mock: find and update notification
    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: notification } as unknown as ApiResponse<Notification>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// API: Mark all notifications as read (PUT /admin/notifications/read-all)
export const readAllNotificationsByIdsAndAccountId = async (ids: number[]) => {
  try {
    // In real app: const res = await axiosInstance.put(`/admin/notifications/read-all`, { ids });
    
    // Mock: mark all as read
    ids.forEach((id) => {
      const notification = mockNotifications.find((n) => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: { success: true } } as unknown as ApiResponse<{ success: boolean }>;
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
  job_done: {
    title: "Công việc hoàn thành",
    getMessage: (employeeName: string, jobCode: string) =>
      `${employeeName} vừa hoàn thành công việc ${jobCode}`,
  },
  review_submitted: {
    title: "Review hoàn thành",
    getMessage: (qaName: string, jobCode: string) =>
      `${qaName} vừa submit review cho công việc ${jobCode}`,
  },
  job_assigned: {
    title: "Công việc được giao",
    getMessage: (jobCode: string, customerName: string) =>
      `Bạn được giao công việc ${jobCode} từ khách hàng ${customerName}`,
  },
  review_assigned: {
    title: "Yêu cầu review công việc",
    getMessage: (employeeName: string, jobCode: string) =>
      `Công việc ${jobCode} của ${employeeName} đang chờ review`,
  },
};
