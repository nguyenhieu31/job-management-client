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
  jobIds: number[];
  customerId: number;
  notes?: string;
}

export interface InvoiceResponse {
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
