import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { VideoRequest, VideoResponse, VideoViewResponse } from "@/types/videos";
import { FileStorage } from "@/types/jobs";

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

export const getAllVideosBySalerAssignee = async (data: PageRequest & { fromDate?: string | null }) => {
  try {
    const res = await axiosInstance.get(`/admin/videos/saler-assignee`, {
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

export const transitionVideo = async (data: {
  id: number;
  event: string;
  reason?: string;
  linkDone?: string;
}) => {
  try {
    const res = await axiosInstance.put(`/admin/videos/${data.id}/transition`, {
      event: data.event,
      reason: data.reason,
      linkDone: data.linkDone,
    });
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
    customerCode?: string | null;
    assignedSaleIds?: number[];
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
        customerCode: data.customerCode || undefined,
        assignedSaleIds: data.assignedSaleIds && data.assignedSaleIds.length > 0
          ? data.assignedSaleIds
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
  editedNumber?: number | null;
  qaOutputNumber?: number | null;
  qualifiedAssigneeId?: number | null;
  paymentStatus?: string | null;
  paymentEmployee?: string | null;
  doneLink?: string | null;
  payPerFile?: number | null;
  totalPayPerFile?: number | null;
  payPerFileQa?: number | null;
  assignedSaleId?: number | null;
  isDeleteAssignee?: boolean;
  fileStoragesNeedRemove?: FileStorage[];
}, images?: File[], videos?: File[], imageTempUrls?: string[], videoTempUrls?: string[]) => {
  try {
    const formData = new FormData();

    // Append all fields to FormData
    if (data.jobId != null) formData.append("jobId", String(data.jobId));
    if (data.caseName != null) formData.append("caseName", data.caseName);
    if (data.note != null) formData.append("note", data.note);
    if (data.employeeNote != null) formData.append("employeeNote", data.employeeNote);
    if (data.inputLink != null) formData.append("inputLink", data.inputLink);
    if (data.assigneeId != null) formData.append("assigneeId", String(data.assigneeId));
    if (data.customerId != null) formData.append("customerId", String(data.customerId));
    if (data.filePrice != null) formData.append("filePrice", String(data.filePrice));
    if (data.inputNumber != null) formData.append("inputNumber", String(data.inputNumber));
    if (data.outputNumber != null) formData.append("outputNumber", String(data.outputNumber));
    if (data.editedNumber != null) formData.append("editedNumber", String(data.editedNumber));
    if (data.qaOutputNumber != null) formData.append("qaOutputNumber", String(data.qaOutputNumber));
    if (data.qualifiedAssigneeId != null) formData.append("qualifiedAssigneeId", String(data.qualifiedAssigneeId));
    if (data.paymentStatus != null) formData.append("paymentStatus", data.paymentStatus);
    if (data.paymentEmployee != null) formData.append("paymentEmployee", data.paymentEmployee);
    if (data.doneLink != null) formData.append("doneLink", data.doneLink);
    if (data.payPerFile != null) formData.append("payPerFile", String(data.payPerFile));
    if (data.totalPayPerFile != null) formData.append("totalPayPerFile", String(data.totalPayPerFile));
    if (data.payPerFileQa != null) formData.append("payPerFileQa", String(data.payPerFileQa));
    if (data.isDeleteAssignee != null) formData.append("isDeleteAssignee", String(data.isDeleteAssignee));
    if (data.assignedSaleId != null) formData.append("assignedSaleId", String(data.assignedSaleId));

    // Append fileStoragesNeedRemove as JSON string
    if (data.fileStoragesNeedRemove && data.fileStoragesNeedRemove.length > 0) {
      formData.append("fileStoragesNeedRemove", JSON.stringify(data.fileStoragesNeedRemove));
    }

    // Append image files
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file);
      });
    }

    // Append video files
    if (videos && videos.length > 0) {
      videos.forEach((file) => {
        formData.append("videos", file);
      });
    }

    // Append imageTempUrls as JSON string
    if (imageTempUrls && imageTempUrls.length > 0) {
      formData.append("imageTempUrls", JSON.stringify(imageTempUrls));
    }

    // Append videoTempUrls as JSON string
    if (videoTempUrls && videoTempUrls.length > 0) {
      formData.append("videoTempUrls", JSON.stringify(videoTempUrls));
    }

    const res = await axiosInstance.post(
      `/admin/videos/update-grid-view`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

// Helper to build FormData from VideoRequest + files
const buildVideoFormData = (
  data: VideoRequest,
  images?: File[],
  videos?: File[],
  imageTempUrls?: string[],
  videoTempUrls?: string[],
): FormData => {
  const formData = new FormData();

  if (data.id != null) formData.append("id", String(data.id));
  if (data.code != null) formData.append("code", data.code);
  if (data.caseName != null) formData.append("caseName", data.caseName);
  if (data.fileCount != null) formData.append("fileCount", String(data.fileCount));
  if (data.filePrice != null) formData.append("filePrice", String(data.filePrice));
  if (data.payPerFile != null) formData.append("payPerFile", String(data.payPerFile));
  if (data.inputNumber != null) formData.append("inputNumber", String(data.inputNumber));
  if (data.outputNumber != null) formData.append("outputNumber", String(data.outputNumber));
  if (data.editedNumber != null) formData.append("editedNumber", String(data.editedNumber));
  if (data.paymentStatus != null) formData.append("paymentStatus", data.paymentStatus);
  if (data.paymentEmployee != null) formData.append("paymentEmployee", data.paymentEmployee);
  if (data.jobStatus != null) formData.append("jobStatus", data.jobStatus);
  if (data.inputLink != null) formData.append("inputLink", data.inputLink);
  if (data.doneLink != null) formData.append("doneLink", data.doneLink);
  if (data.note != null) formData.append("note", data.note);
  if (data.employeeNote != null) formData.append("employeeNote", data.employeeNote);
  if (data.assigneeId != null) formData.append("assigneeId", String(data.assigneeId));
  if (data.customerId != null) formData.append("customerId", String(data.customerId));
  if (data.workRequestId != null) formData.append("workRequestId", String(data.workRequestId));
  if (data.isDeleteAssignee != null) formData.append("isDeleteAssignee", String(data.isDeleteAssignee));
  if (data.assignedSaleId != null) formData.append("assignedSaleId", String(data.assignedSaleId));

  if (data.fileStoragesNeedRemove && data.fileStoragesNeedRemove.length > 0) {
    formData.append(
      "fileStoragesNeedRemove",
      JSON.stringify(data.fileStoragesNeedRemove),
    );
  }

  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append("images", file);
    });
  }

  if (videos && videos.length > 0) {
    videos.forEach((file) => {
      formData.append("videos", file);
    });
  }

  if (imageTempUrls && imageTempUrls.length > 0) {
    formData.append("imageTempUrls", JSON.stringify(imageTempUrls));
  }

  if (videoTempUrls && videoTempUrls.length > 0) {
    formData.append("videoTempUrls", JSON.stringify(videoTempUrls));
  }

  return formData;
};

export const createVideo = async (
  data: VideoRequest,
  images?: File[],
  videos?: File[],
  imageTempUrls?: string[],
  videoTempUrls?: string[],
) => {
  try {
    const formData = buildVideoFormData(
      data,
      images,
      videos,
      imageTempUrls,
      videoTempUrls,
    );
    const res = await axiosInstance.post(`/admin/videos/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res as unknown as ApiResponse<VideoResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateVideoFull = async (
  data: VideoRequest,
  images?: File[],
  videos?: File[],
  imageTempUrls?: string[],
  videoTempUrls?: string[],
) => {
  try {
    const formData = buildVideoFormData(
      data,
      images,
      videos,
      imageTempUrls,
      videoTempUrls,
    );
    const res = await axiosInstance.put(
      `/admin/videos/update/${data.id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
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
