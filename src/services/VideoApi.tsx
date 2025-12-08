import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { VideoRequest, VideoResponse, VideoViewResponse } from "@/types/videos";

export const getAllVideos = async (data: PageRequest & { fromDate?: string | null }) => {
  try {
    const res = await axiosInstance.get(`/admin/videos`, {
      params: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        fromDate: data.fromDate,
      },
    });
    return res as unknown as ApiResponse<PageResponse<VideoResponse[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getAllVideosByAssignee = async (
  data: PageRequest & { email: string; fromDate?: string | null }
) => {
  try {
    const res = await axiosInstance.get(`/admin/videos/assignee`, {
      params: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        email: data.email,
        fromDate: data.fromDate,
      },
    });
    return res as unknown as ApiResponse<PageResponse<VideoResponse[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateVideoStatus = async (data: {
  id: number;
  status: string;
  qaNote?: string;
  qaOutputNumber?: number | null;
}) => {
  try {
    const res = await axiosInstance.put(
      `/admin/videos/update/status/${data.id}?status=${data.status}&qaNote=${
        data.qaNote || ""
      }`
    );
    return res as unknown as ApiResponse<string>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getRandomVideo = async () => {
  try {
    const res = await axiosInstance.get(`/admin/videos/random`);
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const searchVideoByConditions = async (
  data: PageRequest & {
    keyword: string | null;
    videoStatus: string | null;
    paymentStatus: string | null;
    paymentEmployee?: string | null;
    startDate: string | null;
    endDate: string | null;
    selectedEmployeeIds?: number[];
    selectedCustomerIds?: number[];
  }
) => {
  try {
    const res = await axiosInstance.get(`/admin/videos/search-conditions`, {
      params: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        keyword: data.keyword,
        videoStatus: data.videoStatus,
        paymentStatus: data.paymentStatus,
        paymentEmployee: data.paymentEmployee,
        startDate: data.startDate,
        endDate: data.endDate,
        selectedEmployeeIds: data.selectedEmployeeIds
          ? data.selectedEmployeeIds
          : undefined,
        selectedCustomerIds: data.selectedCustomerIds
          ? data.selectedCustomerIds
          : undefined,
      },
    });
    return res as unknown as ApiResponse<PageResponse<VideoResponse[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const searchVideoView = async (keyword: string) => {
  try {
    const res = await axiosInstance.get(
      `/admin/video-view/search?caseName=${keyword}`
    );
    return res as unknown as ApiResponse<VideoViewResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateGridViewVideo = async (data: {
  jobId: number;
  caseName?: string | null;
  note?: string | null;
  employeeNote?: string | null;
  inputLink?: string | null;
  assigneeId: number | null;
  customerId: number | null;
  filePrice: number | null;
  inputNumber: number | null;
  outputNumber?: number | null;
  qaOutputNumber?: number | null;
  qualifiedAssigneeId?: number | null;
  paymentStatus?: string | null;
  paymentEmployee?: string | null;
  doneLink?: string | null;
  payPerFile?: number | null;
  payPerFileQa?: number | null;
  isDeleteAssignee?: boolean;
}) => {
  try {
    const res = await axiosInstance.post(
      `/admin/videos/update-grid-view`,
      data
    );
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const createVideo = async (data: VideoRequest) => {
  try {
    const res = await axiosInstance.post(`/admin/videos/create`, data);
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateVideoFull = async (data: VideoRequest) => {
  try {
    const res = await axiosInstance.put(
      `/admin/videos/update/${data.id}`,
      data
    );
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const deleteVideoById = async (videoId: number) => {
  try {
    const res = await axiosInstance.delete(`/admin/videos/delete/${videoId}`);
    return res as unknown as ApiResponse<null>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const deleteMultipleVideos = async (videoIds: number[]) => {
  try {
    const res = await axiosInstance.post(
      `/admin/videos/delete/multiple-video`,
      { data: { ids: videoIds } }
    );
    return res as unknown as ApiResponse<void>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updatePaymentEmployeeMultipleVideos = async (videoIds: number[]) => {
  try {
    const res = await axiosInstance.post(
      `/admin/videos/update/payment-employee-status/multiple-video`,
      { ids: videoIds }
    );
    return res as unknown as ApiResponse<void>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updatePaymentMultipleVideos = async (videoIds: number[]) => {
  try {
    const res = await axiosInstance.post(
      `/admin/videos/update/payment-status/multiple-video`,
      { ids: videoIds }
    );
    return res as unknown as ApiResponse<void>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
