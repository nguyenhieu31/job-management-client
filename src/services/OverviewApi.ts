import { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance } from "@/lib/utils/axios-instance";
import {
  OverviewDashboardResponse,
  StatusCountStatsResponse,
  RevenueStatsResponse,
  TimePeriod,
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
  period: TimePeriod,
  year?: number
): Promise<ApiResponse<StatusCountStatsResponse>> => {
  try {
    const params: Record<string, any> = { period };
    if (year) params.year = year;
    const res = await axiosInstance.get(`/admin/overview/jobs-by-status`, {
      params,
    });
    return res as unknown as ApiResponse<StatusCountStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getVideosByStatus = async (
  period: TimePeriod,
  year?: number
): Promise<ApiResponse<StatusCountStatsResponse>> => {
  try {
    const params: Record<string, any> = { period };
    if (year) params.year = year;
    const res = await axiosInstance.get(`/admin/overview/videos-by-status`, {
      params,
    });
    return res as unknown as ApiResponse<StatusCountStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getRevenue = async (
  period: TimePeriod,
  year?: number
): Promise<ApiResponse<RevenueStatsResponse>> => {
  try {
    const params: Record<string, any> = { period };
    if (year) params.year = year;
    const res = await axiosInstance.get(`/admin/overview/revenue`, { params });
    return res as unknown as ApiResponse<RevenueStatsResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
