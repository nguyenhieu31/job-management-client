import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { JobRequest, JobResponse, JobViewResponse } from "@/types/jobs";

export const getAllJobs = async (data: PageRequest & {fromDate: string | null}) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            fromDate: data.fromDate
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getAllJobsByAssignee = async (data: PageRequest & { email: string; fromDate?: string | null }) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/assignee`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            email: data.email,
            fromDate: data.fromDate
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getAllJobsByQualifiedAssignee = async (data: PageRequest & { email: string; fromDate?: string | null }) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/qualified-assignee`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            email: data.email,
            fromDate: data.fromDate
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateJobStatus = async (data: {id: number; status: string; qaNote?: string; qaOutputNumber?: number | null;}) => {
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
    paymentEmployee: string | null;
    startDate: string | null; 
    endDate: string | null;
    selectedEmployeeIds?: number[];
    selectedCustomerIds?: number[];
}) => {
    try {
        const res = await axiosInstance.get(`/admin/jobs/search-conditions`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            keyword: data.keyword,
            jobStatus: data.jobStatus,
            paymentStatus: data.paymentStatus,
            paymentEmployee: data.paymentEmployee,
            startDate: data.startDate,
            endDate: data.endDate,
            selectedEmployeeIds: data.selectedEmployeeIds ? data.selectedEmployeeIds : undefined,
            selectedCustomerIds: data.selectedCustomerIds ? data.selectedCustomerIds : undefined,
        } });
        return res as unknown as ApiResponse<PageResponse<JobResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const searchJobView = async (keyword: string) => {
    try {
        const res = await axiosInstance.get(`/admin/job-view/search?caseName=${keyword}`);
        return res as unknown as ApiResponse<JobViewResponse[]>;
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
    qaOutputNumber?: number | null;
    qualifiedAssigneeId : number | null;
    paymentStatus?: string | null;
    paymentEmployee?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
    employeeNote?: string | null;
    isDeleteAssignee?: boolean;
    isDeleteQualifiedAssignee?: boolean;
}) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/update-grid-view`, data);
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}


// Helper to build FormData from JobRequest + files
const buildJobFormData = (data: JobRequest, images?: File[], videos?: File[]): FormData => {
    const formData = new FormData();

    // Append all job fields to FormData
    if (data.id != null) formData.append("id", String(data.id));
    if (data.code != null) formData.append("code", data.code);
    if (data.caseName != null) formData.append("caseName", data.caseName);
    if (data.fileCount != null) formData.append("fileCount", String(data.fileCount));
    if (data.filePrice != null) formData.append("filePrice", String(data.filePrice));
    if (data.payPerFile != null) formData.append("payPerFile", String(data.payPerFile));
    if (data.payPerFileQa != null) formData.append("payPerFileQa", String(data.payPerFileQa));
    if (data.inputNumber != null) formData.append("inputNumber", String(data.inputNumber));
    if (data.outputNumber != null) formData.append("outputNumber", String(data.outputNumber));
    if (data.qaOutputNumber != null) formData.append("qaOutputNumber", String(data.qaOutputNumber));
    if (data.paymentStatus != null) formData.append("paymentStatus", data.paymentStatus);
    if (data.paymentEmployee != null) formData.append("paymentEmployee", data.paymentEmployee);
    if (data.paymentEmployeeQa != null) formData.append("paymentEmployeeQa", data.paymentEmployeeQa);
    if (data.jobStatus != null) formData.append("jobStatus", data.jobStatus);
    if (data.inputLink != null) formData.append("inputLink", data.inputLink);
    if (data.doneLink != null) formData.append("doneLink", data.doneLink);
    if (data.note != null) formData.append("note", data.note);
    if (data.employeeNote != null) formData.append("employeeNote", data.employeeNote);
    if (data.assigneeId != null) formData.append("assigneeId", String(data.assigneeId));
    if (data.qualifiedAssigneeId != null) formData.append("qualifiedAssigneeId", String(data.qualifiedAssigneeId));
    if (data.customerId != null) formData.append("customerId", String(data.customerId));
    if (data.workRequestId != null) formData.append("workRequestId", String(data.workRequestId));
    if (data.deadline != null) formData.append("deadline", data.deadline);
    if (data.isDeleteAssignee != null) formData.append("isDeleteAssignee", String(data.isDeleteAssignee));
    if (data.isDeleteQualifiedAssignee != null) formData.append("isDeleteQualifiedAssignee", String(data.isDeleteQualifiedAssignee));
    
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

    return formData;
};

export const createJob = async (data: JobRequest, images?: File[], videos?: File[]) => {
    try {
        const formData = buildJobFormData(data, images, videos);
        const res = await axiosInstance.post(`/admin/jobs/create`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res as unknown as ApiResponse<JobResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateJobFull = async (data: JobRequest, images?: File[], videos?: File[]) => {
    try {
        const formData = buildJobFormData(data, images, videos);
        const res = await axiosInstance.put(`/admin/jobs/update/${data.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
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
        const res = await axiosInstance.post(`/admin/jobs/delete/multiple-job`, {  ids: jobIds });
        return res as unknown as ApiResponse<void>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updatePaymentEmployeeMultipleJobs = async (jobIds: number[]) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/update/payment-employee-status/multiple-job`, { ids: jobIds });
        return res as unknown as ApiResponse<void>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updatePaymentMultipleJobs = async (jobIds: number[]) => {
    try {
        const res = await axiosInstance.post(`/admin/jobs/update/payment-status/multiple-job`, { ids: jobIds });
        return res as unknown as ApiResponse<void>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}