import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { EmployeeRequest, EmployeeResponse } from "@/types/employees";

export const getAllEmployees = async (data: PageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/employees`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
        } });
        return res as unknown as ApiResponse<PageResponse<EmployeeResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createEmployee = async (data: EmployeeRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/employees/create`, data);
        return res as unknown as ApiResponse<EmployeeResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}
export const updateEmployee = async (data: EmployeeRequest) => {
    try {
        const res = await axiosInstance.put(`/admin/employees/${data.id}`, data);
        return res as unknown as ApiResponse<EmployeeResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const resetPasswordEmployee = async (id: number) => {
    try {
        const res = await axiosInstance.put(`/admin/employees/reset-password/${id}`);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteEmployee = async (employeeId: number) => {
    try {
        const res = await axiosInstance.delete(`/admin/employees/${employeeId}`);
        return res as unknown as ApiResponse<null>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const searchEmployees = async (data: PageRequest & { keyword: string }) => {
    try {
        const res = await axiosInstance.get(`/admin/employees/search`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            keyword: data.keyword
        } });
        return res as unknown as ApiResponse<PageResponse<EmployeeResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}