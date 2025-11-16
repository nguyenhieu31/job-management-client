import { EmployeeResponse } from "./employees";

export type PayrollStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED"

export interface PayrollItem {
  code: string;
  createdAt?: Date;
  caseName: string;
  outputNumber: number;
  payPerFile: number;
  amount: number;
}

export interface EmployeePayroll {
  id: number;
  payrollPeriod: string;
  jobs: PayrollItem[];
  totalAmount: number;
  payrollStatus: PayrollStatus;
  approvedBy?: string;
  approveDate?: Date;
  employee: EmployeeResponse;
  paidDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayrollRequest {
  payrollPeriod: string;
  employeeIds?: number[]; // Nếu undefined, tính tất cả nhân viên
}

export interface PayrollResponse {
  id: number;
  payrollPeriod: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;
  items: PayrollItem[];
  subtotal: number;
  deductions: number;
  bonus: number;
  total: number;
  status: PayrollStatus;
  approvedBy?: string;
  approvalDate?: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Filter interface
export interface PayrollFilters {
  payrollPeriod: string;
  employeeName: string;
  status: PayrollStatus | "";
  fromAmount: number;
  toAmount: number;
}

// Summary statistics
export interface PayrollSummary {
  totalEmployees: number;
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  pendingAmount: number;
  averageSalary: number;
}
