export type NotificationType = "JOB_DONE" | "REVIEW_SUBMITTED" | "JOB_ASSIGNED" | "REVIEW_ASSIGNED" | "JOB_REJECTED" | "ORDER_SUBMITTED" | "ORDER_COMPLETED" | "ORDER_REVISION_REQUESTED"

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
  "ORDER_SUBMITTED": {
    title: "Đơn hàng đã được tạo",
    getMessage: (orderCode: string) =>
      `Đơn hàng ${orderCode} của bạn đã được gửi thành công`,
  },
  "ORDER_COMPLETED": {
    title: "Đơn hàng hoàn thành",
    getMessage: (orderCode: string) =>
      `Đơn hàng ${orderCode} của bạn đã hoàn thành`,
  },
  "ORDER_REVISION_REQUESTED": {
    title: "Yêu cầu chỉnh sửa đơn hàng",
    getMessage: (customerName: string, orderCode: string) =>
      `Khách hàng ${customerName} yêu cầu chỉnh sửa cho đơn hàng ${orderCode}`,
  },
}
