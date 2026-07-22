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
