// Overview Dashboard TypeScript Types

export type JobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DONE"
  | "REJECTED"
  | "IN_REVIEW"
  | "REVIEWED"
  | "COMPLETED";

export type TimePeriod =
  | "DAY"
  | "7_DAYS"
  | "CURRENT_MONTH"
  | "PREVIOUS_MONTH"
  | "3_MONTHS"
  | "YEAR";

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface RevenueStatsResponse {
  period: TimePeriod;
  selectedYear: number;
  totalRevenue: number;
  dataPoints: RevenueDataPoint[];
}

export interface StatusCountStatsResponse {
  period: TimePeriod;
  selectedYear: number;
  countsByStatus: Record<JobStatus, number>;
}

export interface OverviewDashboardResponse {
  accountsReceivable: number;
  totalCustomers: number;
  totalEmployees: number;
  jobsByStatus: Record<JobStatus, number>;
  videosByStatus: Record<JobStatus, number>;
  revenueStats: RevenueStatsResponse;
}

export interface OverviewFilterParams {
  period: TimePeriod;
  year?: number;
}

export interface EmployeeOption {
  id: number;
  fullName: string;
  code: string;
}

export interface EmployeeStatItem {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  total: number;
  countsByStatus: Record<JobStatus, number>;
}

export interface EmployeeStatsResponse {
  period: TimePeriod;
  selectedYear: number;
  selectedEmployeeId?: number | null;
  selectedEmployeeIds?: number[];
  employees: EmployeeStatItem[];
  allEmployees: EmployeeOption[];
  countsByStatus: Record<JobStatus, number>;
  total: number;
}

export interface EmployeeStatsFilterParams {
  period: TimePeriod;
  year?: number;
  employeeId?: number | null;
  employeeIds?: number[];
}
