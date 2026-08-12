import { WorkRequestResponse } from "./work-requests";
import { FileStorage } from "./jobs";
import type { SaleInfo } from "./customers";

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
  customerNote?: string;
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
  paymentEmployee: EmployeePaymentStatus;
  jobStatus: VideoStatus;
  deliveryStatus?: VideoDeliveryStatus;
  revisionStatus?: VideoRevisionStatus;
  rejectReason?: string | null;
  inputLink: string;
  doneLink: string;
  note: string;
  employeeNote?: string | null;
  assignee: AssigneeInfo;
  customer: CustomerInfo;
  assignedSale?: SaleInfo | null;
  workRequest: WorkRequestResponse;
  payPerFile: number;
  totalPayPerFile: number;
  editedNumber: number;
  createdAt: Date;
  updatedAt: Date;
  fileStorages?: FileStorage[];
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
  editedNumber?: number | null;
  paymentStatus: PaymentStatus;
  paymentEmployee?: EmployeePaymentStatus;
  jobStatus: VideoStatus;
  inputLink: string;
  doneLink?: string | null;
  note: string | null;
  employeeNote?: string | null;
  assigneeId: number | null;
  customerId: number | null;
  workRequestId: number | null;
  assignedSaleId?: number | null;
  isDeleteAssignee?: boolean;
  totalPayPerFile?: number;
  fileStoragesNeedRemove?: FileStorage[];
}

export type VideoStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "COMPLETED";

export type VideoDeliveryStatus = "NONE" | "NOT_DELIVERED" | "DELIVERED";
export type VideoRevisionStatus =
  | "NONE"
  | "REVISION_REQUESTED"
  | "REVISION_IN_PROGRESS"
  | "REVISION_DONE";

export type VideoTransitionEvent =
  | "TAKE"
  | "DONE"
  | "APPROVE"
  | "REJECT"
  | "MARK_DELIVERED"
  | "REQUEST_REVISION"
  | "START_REVISION"
  | "FINISH_REVISION"
  | "RE_REQUEST_REVISION"
  | "ACCEPT_REVISION";

export type PaymentStatus =
  | "UNPAID"
  | "INVOICE_SENT"
  | "PAID"
  | "INVOICE_DRAFT"
  | "CANCELLED"
  | "NOT_PAYABLE";
export type EmployeePaymentStatus = "UNPAID" | "PAID";

// Video action types for different roles
export type VideoAction =
  | "take-video"
  | "done-video"
  | "complete-video"
  | "reject-video"
  | "mark-delivered"
  | "request-revision"
  | "start-revision"
  | "finish-revision"
  | "re-request-revision"
  | "accept-revision"
  | "edit"
  | "delete";

// For action with note
export interface VideoActionPayload {
  videoId: number;
  action: VideoAction;
  qaNote?: string;
  reason?: string;
  linkDone?: string;
  qaOutputNumber?: number | null;
}

export type UserRole = "manager" | "qa" | "employee" | "special" | "saler";

// Filter interface
export interface VideoFilters {
  fromDate: string;
  toDate: string;
  videoStatus: VideoStatus | "";
  paymentStatus: PaymentStatus | "";
  paymentEmployee: string;
  keyword: string;
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Columns visible for each role
// R8: hide outputCount, editedNumber, editedFee, payPerFile from table (still editable in form)
export const ROLE_COLUMNS = {
  manager: [
    "code",
    "date",
    "customerName",
    "caseName",
    "linkInput",
    "inputCount",
    "filePrice",
    "totalPrice",
    "jobStatus",
    "linkDone",
    "totalPayPerFile",
    // "assignedSale",
    "assignedEmployee",
    "note",
    "relatedWork",
    // "paymentStatus",
    "actions",
  ],
  employee: [
    "code",
    "date",
    "caseName",
    "linkInput",
    "linkDone",
    "inputCount",
    "totalPayPerFile",
    "jobStatus",
    "note",
    "rejectReason",
    "relatedWork",
    "actions",
  ],
  special: [
    "code",
    "date",
    "caseName",
    "linkInput",
    "linkDone",
    "inputCount",
    "totalPayPerFile",
    "jobStatus",
    "note",
    "rejectReason",
    "employeeNote",
    "paymentEmployee",
    "relatedWork",
    "actions",
  ],
  saler: [
    "code",
    "date",
    "customerName",
    "caseName",
    "linkInput",
    "inputCount",
    "filePrice",
    "totalPrice",
    "jobStatus",
    "linkDone",
    // "assignedSale",
    "assignedEmployee",
    "note",
    "relatedWork",
    "paymentStatus",
    // "actions",
  ],
} as const;
