import { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance } from "@/lib/utils/axios-instance";
import {
  OverviewDashboardResponse,
  StatusCountStatsResponse,
  RevenueStatsResponse,
  EmployeeStatsResponse,
  TimePeriod,
  OverviewDateRangeParams,
} from "@/types/overview";

export const getDashboardSummary = async (): Promise<
  ApiResponse<OverviewDashboardResponse>
> => {
  try {
    const res = await axiosInstance.get(`/admin/overview/dashboard`);
    return res as unknown as ApiResponse<OverviewDashboardResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getJobsByStatus = async (
  fromDate: string,
  toDate?: string
): Promise<ApiResponse<StatusCountStatsResponse>> => {
  try {
    const params: OverviewDateRangeParams = { fromDate };
    if (toDate) params.toDate = toDate;
    const res = await axiosInstance.get(`/admin/overview/jobs-by-status`, {
      params,
    });
    return res as unknown as ApiResponse<StatusCountStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getVideosByStatus = async (
  fromDate: string,
  toDate?: string
): Promise<ApiResponse<StatusCountStatsResponse>> => {
  try {
    const params: OverviewDateRangeParams = { fromDate };
    if (toDate) params.toDate = toDate;
    const res = await axiosInstance.get(`/admin/overview/videos-by-status`, {
      params,
    });
    return res as unknown as ApiResponse<StatusCountStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getRevenue = async (
  fromDate: string,
  toDate?: string
): Promise<ApiResponse<RevenueStatsResponse>> => {
  try {
    const params: OverviewDateRangeParams = { fromDate };
    if (toDate) params.toDate = toDate;
    const res = await axiosInstance.get(`/admin/overview/revenue`, { params });
    return res as unknown as ApiResponse<RevenueStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getJobsByEmployee = async (
  fromDate: string,
  toDate?: string,
  employeeIds?: number[]
): Promise<ApiResponse<EmployeeStatsResponse>> => {
  try {
    const params: Record<string, any> = { fromDate };
    if (toDate) params.toDate = toDate;
    if (employeeIds && employeeIds.length > 0) {
      params.employeeIds = employeeIds.join(",");
    }
    const res = await axiosInstance.get(`/admin/overview/jobs-by-employee`, {
      params,
    });
    return res as unknown as ApiResponse<EmployeeStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getVideosByEmployee = async (
  fromDate: string,
  toDate?: string,
  employeeIds?: number[]
): Promise<ApiResponse<EmployeeStatsResponse>> => {
  try {
    const params: Record<string, any> = { fromDate };
    if (toDate) params.toDate = toDate;
    if (employeeIds && employeeIds.length > 0) {
      params.employeeIds = employeeIds.join(",");
    }
    const res = await axiosInstance.get(`/admin/overview/videos-by-employee`, {
      params,
    });
    return res as unknown as ApiResponse<EmployeeStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
