export type NotificationType = "job_done" | "review_submitted" | "job_assigned" | "review_assigned"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  jobCode?: string
  senderName: string
  senderEmail: string
  isRead: boolean
  createdAt: Date
}

export interface NotificationResponse {
  data: Notification[]
  count: number
  unreadCount: number
}

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
}
