import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { JobRequest, JobResponse } from "@/types/jobs";

export const getAllJobs = async (data: PageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getAllJobsByAssignee = async (data: PageRequest & { email: string }) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/assignee`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            email: data.email
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getAllJobsByQualifiedAssignee = async (data: PageRequest & { email: string }) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/qualified-assignee`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            email: data.email
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateJobStatus = async (data: {id: number; status: string; qaNote?: string}) => {
    try {
        const res = await axiosInstance.put(`/admin/jobs/update/status/${data.id}?status=${data.status}&qaNote=${data.qaNote || ""}`);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getRandomJob = async () =>{
    try {
        const res = await axiosInstance.get(`/admin/jobs/random`);
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}


export const searchJobByConditions = async (data: PageRequest & { 
    keyword: string | null; 
    jobStatus: string | null; 
    paymentStatus: string | null; 
    startDate: string | null; 
    endDate: string | null;
}) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/search-conditions`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            keyword: data.keyword,
            jobStatus: data.jobStatus,
            paymentStatus: data.paymentStatus,
            startDate: data.startDate,
            endDate: data.endDate
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateGridViewJob = async (data: {
    jobId: number;
    assigneeId : number | null;
    customerId : number | null;
    filePrice : number | null;
    inputNumber : number | null;
    outputNumber?: number | null;
    qualifiedAssigneeId : number | null;
    paymentStatus?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
}) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/update-grid-view`, data);
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}


export const createJob = async (data: JobRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/create`, data);
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateJobFull = async (data: JobRequest) => {
    try {
        const res = await axiosInstance.put(`/admin/jobs/update/${data.id}`, data);
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteJobById = async (jobId: number) => {
    try {
        const res = await axiosInstance.delete(`/admin/jobs/delete/${jobId}`);
        return res as unknown as ApiResponse<null>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteMultipleJobs = async (jobIds: number[]) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/delete/multiple-job`, { data: { ids: jobIds } });
        return res as unknown as ApiResponse<void>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}