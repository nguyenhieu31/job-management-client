import type { Notification, NotificationResponse } from "@/types/notifications";

// Mock notifications database (in real app, this would be on backend)
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "job_done",
    title: "Công việc hoàn thành",
    message: "Nhân viên Nguyễn Văn A vừa hoàn thành công việc JOB-001",
    jobCode: "JOB-001",
    jobId: 1,
    senderName: "Nhân viên Nguyễn Văn A",
    senderEmail: "employee1@example.com",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
  },
  {
    id: 2,
    type: "review_submitted",
    title: "Review hoàn thành",
    message: "QA Trần Thị B vừa submit review cho công việc JOB-001",
    jobCode: "JOB-001",
    jobId: 1,
    senderName: "QA Trần Thị B",
    senderEmail: "qa1@example.com",
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000),
  },
  {
    id: 3,
    type: "job_assigned",
    title: "Công việc được giao",
    message: "Bạn được giao công việc JOB-002 từ khách hàng ABC Company",
    jobCode: "JOB-002",
    jobId: 2,
    senderName: "Hệ thống",
    senderEmail: "system@example.com",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 3600000),
  },
];

export const getNotifications = async (page: number = 0, size: number = 10) => {
  try {
    // In real app: const res = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
    
    // Mock: simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotifications = mockNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = page * size;
    const end = start + size;
    const paginatedNotifications = allNotifications.slice(start, end);
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    return {
      data: paginatedNotifications,
      count: allNotifications.length,
      unreadCount,
    } as NotificationResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const markAsRead = async (notificationId: number) => {
  try {
    // In real app: const res = await axiosInstance.put(`/notifications/${notificationId}/read`);
    
    // Mock: find and update notification
    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const markAllAsRead = async () => {
  try {
    // In real app: const res = await axiosInstance.put(`/notifications/mark-all-read`);
    
    // Mock: mark all as read
    mockNotifications.forEach((n) => {
      n.isRead = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const deleteNotification = async (notificationId: number) => {
  try {
    // In real app: const res = await axiosInstance.delete(`/notifications/${notificationId}`);
    
    // Mock: remove notification
    const index = mockNotifications.findIndex((n) => n.id === notificationId);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Function to add notification (called when job actions happen)
export const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
  const newNotification: Notification = {
    ...notification,
    id: Math.max(...mockNotifications.map((n) => n.id), 0) + 1,
    createdAt: new Date(),
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
