import { WorkRequestResponse } from "./work-requests";

export interface AssigneeInfo {
  id: number;
  code: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  chatId: string;
}

export interface CustomerInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface VideoViewResponse {
  id: number;
  videoId: number;
  code: string;
  caseName: string;
  isDeleted: boolean;
}

export interface VideoResponse {
  id: number;
  code: string;
  caseName: string;
  fileCount: number;
  filePrice: number;
  totalPrice: number;
  inputNumber: number;
  outputNumber: number;
  paymentStatus: PaymentStatus;
  jobStatus: VideoStatus;
  inputLink: string;
  doneLink: string;
  note: string;
  assignee: AssigneeInfo;
  customer: CustomerInfo;
  workRequest: WorkRequestResponse;
  payPerFile: number;
  totalPayPerFile: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoRequest {
  id?: number | null;
  code?: string | null;
  caseName: string;
  fileCount: number;
  filePrice: number;
  payPerFile: number;
  inputNumber: number;
  outputNumber?: number | null;
  paymentStatus: PaymentStatus;
  jobStatus: VideoStatus;
  inputLink: string;
  doneLink?: string | null;
  note: string | null;
  assigneeId: number | null;
  customerId: number | null;
  workRequestId: number | null;
  isDeleteAssignee?: boolean;
}

export type VideoStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DONE"
  | "COMPLETED";

export type PaymentStatus =
  | "UNPAID"
  | "INVOICE_SENT"
  | "PAID"
  | "INVOICE_DRAFT"
  | "CANCELLED";

// Video action types for different roles
export type VideoAction =
  | "take-video" // Employee takes the video (pending -> in-progress)
  | "done-video" // Employee marks video as done (in-progress -> done)
  | "complete-video" // Manager marks as completed (done -> completed)
  | "edit" // Manager edits video
  | "delete"; // Manager deletes video

// For action with note
export interface VideoActionPayload {
  videoId: number;
  action: VideoAction;
  qaNote?: string;
  qaOutputNumber?: number | null;
}

export type UserRole = "manager" | "qa" | "employee";

// Filter interface
export interface VideoFilters {
  fromDate: string;
  toDate: string;
  videoStatus: VideoStatus | "";
  paymentStatus: PaymentStatus | "";
  keyword: string;
  selectedEmployeeIds?: number[];
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Columns visible for each role
export const ROLE_COLUMNS = {
  manager: [
    "code",
    "date",
    "customerName",
    "caseName",
    "linkInput",
    "inputCount",
    "outputCount",
    "filePrice",
    "totalPrice",
    "jobStatus",
    "paymentStatus",
    "linkDone",
    "payPerFile",
    "totalPayPerFile",
    "assignedEmployee",
    "note",
    "actions",
  ],
  employee: [
    "code",
    "date",
    "caseName",
    "workRequest",
    "linkInput",
    "linkDone",
    "inputCount",
    "outputCount",
    "jobStatus",
    "payPerFile",
    "totalPayPerFile",
    "note",
    "actions",
  ],
} as const;
