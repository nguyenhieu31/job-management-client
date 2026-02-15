import { CustomerInfo, JobResponse } from "./jobs";

export type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "CANCELLED"

export interface InvoiceItem {
  jobId: number;
  jobCode: string;
  caseName: string;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface InvoiceRequest {
  jobs: JobResponse[];
  customerInfo: CustomerInfo;
  notes?: string;
}

export interface InvoicePageRequest {
  pageNumber: number;
  pageSize: number;
  invoiceStatus?: InvoiceStatus | "ALL";
}

export interface InvoiceResponseDetail {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface InvoiceResponse {
  id: number;
  invoiceId: string;
  status: string;
  dueAmount: Record<string, any>;
  amount: Record<string, any>;
  configuration: Record<string, any>;
  items: Record<string, any>[];
  primaryRecipients: Record<string, any>[];
  invoicer: Record<string, any>;
  detail: Record<string, any>;
  numberJob: number;
  createdAt: string;
  createdBy: string;
  company: string;
}


// For grouping jobs by customer
export interface JobsByCustomer {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  jobs: {
    id: number;
    code: string;
    caseName: string;
    totalPrice: number;
    paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  }[];
  totalAmount: number;
}


export interface CustomerJobSummary{
  customer: CustomerInfo;
  totalAmount: number;
  jobs: JobResponse[];
}