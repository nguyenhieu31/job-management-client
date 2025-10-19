import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { WorkRequestRequest, WorkRequestResponse } from "@/types/work-requests";


export const getAllWorkRequests = async (data: PageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/work-requests`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
        } });
        return res as unknown as ApiResponse<PageResponse<WorkRequestResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createWorkRequest = async (data: WorkRequestRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/work-requests/create`, data);
        return res as unknown as ApiResponse<WorkRequestResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateWorkRequest = async (data: WorkRequestRequest) => {
    try {
        const res = await axiosInstance.put(`/admin/work-requests/${data.id}`, data);
        return res as unknown as ApiResponse<WorkRequestResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteWorkRequest = async (workRequestId: number) => {
    try {
        const res = await axiosInstance.delete(`/admin/work-requests/${workRequestId}`);
        return res as unknown as ApiResponse<null>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const searchWorkRequests = async (data: PageRequest & { keyword: string }) => {
    try {
        const res = await axiosInstance.get(`/admin/work-requests/search`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            keyword: data.keyword
        } });
        return res as unknown as ApiResponse<PageResponse<WorkRequestResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}