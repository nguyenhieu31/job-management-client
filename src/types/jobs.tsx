import { WorkRequestResponse } from "./work-requests";
import type { SaleInfo } from "./customers";

export interface Job {
  id: number;
  code: string;
  date: string;
  customerName: string;
  caseName: string;
  linkInput: string;
  linkDone: string;
  inputCount: number;
  outputCount: number;
  filePrice: number;
  totalPrice: number;
  jobStatus: JobStatus;
  paymentStatus: PaymentStatus;
  note: string;
  assignedEmployee: string; // ID hoặc tên người phụ trách
  qa: string; // ID hoặc tên QA
}

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
  customerCode?: string;
  sales?: SaleInfo[];
}

export interface JobViewResponse {
  id: number;
  jobId: number;
  code: string;
  caseName: string;
  isDeleted: boolean;
}

export interface JobAttachment {
  id: number;
  jobId: number;
  fileName: string;
  fileUrl: string;
  fileType: "image" | "video";
  fileSize: number;
  createdAt: Date;
}

export interface FileStorage {
  id : number;
  folderPath: string;
  dropboxLink: string;
  isImage: boolean;
  isJobFile: boolean;
  jobId: number | null;
  videoId: number | null;
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
  qaOutputNumber: number;
  paymentStatus: PaymentStatus;
  paymentEmployee: EmployeePaymentStatus;
  paymentEmployeeQa: EmployeePaymentStatus;
  jobStatus: JobStatus;
  inputLink: string;
  doneLink: string;
  note: string;
  qaNote: string | null;
  employeeNote?: string | null;
  assignee: AssigneeInfo;
  qualifiedAssignee: AssigneeInfo;
  customer: CustomerInfo;
  assignedSale?: SaleInfo | null;
  workRequest: WorkRequestResponse;
  payPerFile: number;
  payPerFileQa: number;
  totalPayPerFile: number;
  totalPayPerFileQa: number;
  deadline: string | null;
  attachments?: JobAttachment[];
  createdAt: Date;
  updatedAt: Date;
  fileStorages?: FileStorage[];
}

export interface JobRequest {
  id?: number | null;
  code?: string | null;
  caseName: string;
  fileCount: number;
  filePrice: number;
  payPerFile: number;
  payPerFileQa: number;
  inputNumber: number;
  outputNumber?: number | null;
  qaOutputNumber?: number | null;
  paymentStatus: PaymentStatus;
  paymentEmployee?: EmployeePaymentStatus;
  paymentEmployeeQa?: EmployeePaymentStatus;
  jobStatus: JobStatus;
  inputLink: string;
  doneLink?: string | null;
  note: string | null;
  employeeNote?: string | null;
  assigneeId: number | null;
  qualifiedAssigneeId: number | null;
  customerId: number | null;
  workRequestId: number | null;
  deadline?: string | null;
  assignedSaleId?: number | null;
  isDeleteAssignee?: boolean;
  isDeleteQualifiedAssignee?: boolean;
  fileStoragesNeedRemove?: FileStorage[];
}

export type JobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DONE"
  | "IN_REVIEW"
  | "REVIEWED"
  | "COMPLETED";
export type PaymentStatus =
  | "UNPAID"
  | "INVOICE_SENT"
  | "PAID"
  | "INVOICE_DRAFT"
  | "CANCELLED"
  | "NOT_PAYABLE";
export type EmployeePaymentStatus =
  | "UNPAID"
  | "PAID";

// Job action types for different roles
export type JobAction =
  | "take-job" // Employee takes the job (pending -> in-progress)
  | "done-job" // Employee marks job as done (in-progress -> done)
  | "take-review" // QA takes job for review (done -> in-review)
  | "submit-review" // QA submits review (in-review -> reviewed)
  | "rejected" // QA rejects job (in-review -> in-progress)
  | "complete-job" // Manager marks as completed (reviewed -> completed)
  | "edit" // Manager edits job
  | "delete"; // Manager deletes job

// For rejected action with note
export interface JobActionPayload {
  jobId: number;
  action: JobAction;
  qaNote?: string; // Note for rejected action
  qaOutputNumber?: number | null;
}

export type UserRole = "manager" | "qa" | "employee" | "special" | "saler";

// Filter interface
export interface JobFilters {
  fromDate: string;
  toDate: string;
  jobStatus: JobStatus | "";
  paymentStatus: PaymentStatus | "";
  paymentEmployee: EmployeePaymentStatus | "";
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
    "deadline",
    "date",
    "customerName",
    "caseName",
    // "workRequest",
    "linkInput",
    "inputCount",
    "outputCount",
    // "fileCount",
    // "filePrice",
    // "totalPrice",
    // "paymentStatus",
    "jobStatus",
    "linkDone",
    // "payPerFile",
    // "totalPayPerFile",
    // "employeeNote",
    // "paymentEmployee",
    // "assignedSale",
    "assignedEmployee",
    "qa",
    // "note",
    "actions",
  ],
  qa: [
    "code",
    "deadline",
    "date",
    "caseName",
    "workRequest",
    "linkInput",
    "linkDone",
    "inputCount",
    "outputCount",
    "qaOutputNumber",
    "payPerFileQa",
    "totalPayPerFileQa",
    "jobStatus",
    "assignedEmployee",
    "note",
    "qaNote",
    "actions",
  ],
  employee: [
    "code",
    "deadline",
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
    "qaNote",
    "actions",
  ],
  special: [
    "code",
    "deadline",
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
    "qaNote",
    "employeeNote",
    "paymentEmployee",
    "actions",
  ],
  saler: [
    "code",
    "deadline",
    "date",
    "customerName",
    "caseName",
    "linkInput",
    "inputCount",
    "outputCount",
    "jobStatus",
    "linkDone",
    "assignedSale",
    "assignedEmployee",
    "qa"
  ]
} as const;

export const PAYROLL_DAY_COLUMN = [
  "code",
  "date",
  "customerName",
  "caseName",
  "outputCount",
  "filePrice",
  "totalPrice",
  "payPerFile",
  "totalPayPerFile",
  "assignedEmployee",
  "qaOutputNumber",
  "payPerFileQa",
  "totalPayPerFileQa"
];
