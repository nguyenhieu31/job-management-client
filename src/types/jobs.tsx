import { WorkRequestResponse } from "./work-requests"

export interface Job {
  id: number
  code: string
  date: string
  customerName: string
  caseName: string
  linkInput: string
  linkDone: string
  inputCount: number
  outputCount: number
  filePrice: number
  totalPrice: number
  jobStatus: JobStatus
  paymentStatus: PaymentStatus
  note: string
  assignedEmployee: string // ID hoặc tên người phụ trách
  qa: string // ID hoặc tên QA
}

export interface AssigneeInfo {
  id: number;
  code: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

export interface CustomerInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface JobResponse {
  id: number;
  code: string;
  caseName: string;
  fileCount: number;
  filePrice: number;
  totalPrice: number;
  inputNumber: number;
  outputNumber: number;
  paymentStatus: PaymentStatus;
  jobStatus: JobStatus;
  inputLink: string;
  doneLink: string;
  note: string;
  qaNote: string | null;
  assignee: AssigneeInfo;
  qualifiedAssignee: AssigneeInfo;
  customer: CustomerInfo;
  workRequest: WorkRequestResponse;
  payPerFile: number;
  totalPayPerFile: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobRequest {
  id?: number | null;
  code?: string | null;
  caseName: string;
  fileCount: number;
  filePrice: number;
  payPerFile: number;
  inputNumber: number;
  outputNumber?: number | null;
  paymentStatus: PaymentStatus;
  jobStatus: JobStatus;
  inputLink: string;
  doneLink?: string | null;
  note: string | null;
  assigneeId: number | null;
  qualifiedAssigneeId: number | null;
  customerId: number | null;
  workRequestId: number | null;
}

export type JobStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "IN_REVIEW" | "REVIEWED" | "COMPLETED"
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID"

// Job action types for different roles
export type JobAction = 
  | "take-job"      // Employee takes the job (pending -> in-progress)
  | "done-job"      // Employee marks job as done (in-progress -> done)
  | "take-review"   // QA takes job for review (done -> in-review)
  | "submit-review" // QA submits review (in-review -> reviewed)
  | "rejected"      // QA rejects job (in-review -> in-progress)
  | "complete-job"  // Manager marks as completed (reviewed -> completed)
  | "edit"          // Manager edits job
  | "delete"        // Manager deletes job

// For rejected action with note
export interface JobActionPayload {
  jobId: number;
  action: JobAction;
  qaNote?: string; // Note for rejected action
}

export type UserRole = "manager" | "qa" | "employee"

// Filter interface
export interface JobFilters {
  fromDate: string
  toDate: string
  jobStatus: JobStatus | ""
  paymentStatus: PaymentStatus | ""
  keyword: string // Search by email or fullname
}

// Pagination interface
export interface Pagination {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// Columns visible for each role
export const ROLE_COLUMNS = {
  manager: [
    "code",
    "date",
    "customerName",
    "caseName",
    // "workRequest",
    // "linkInput",
    "inputCount",
    "outputCount",
    // "fileCount",
    "filePrice",
    "totalPrice",
    "paymentStatus",
    "jobStatus",
    "linkDone",
    "payPerFile",
    "totalPayPerFile",
    "assignedEmployee",
    "qa",
    // "note",
    "actions"
  ],
  qa: [
    "code",
    "date",
    "caseName",
    "workRequest",
    "linkInput",
    "linkDone",
    "inputCount",
    "outputCount",
    "jobStatus",
    "assignedEmployee",
    // "note",
    "qaNote",
    "actions"
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
    // "note",
    "qaNote",
    "actions"
  ]
} as const
