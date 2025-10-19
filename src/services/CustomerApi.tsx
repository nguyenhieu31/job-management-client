import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { CustomerResponse, CustomerRequest } from "@/types/customers";

export const getAllCustomers = async (data: PageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/customers`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
        } });
        return res as unknown as ApiResponse<PageResponse<CustomerResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createCustomer = async (data: CustomerRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/customers/create`, data);
        return res as unknown as ApiResponse<CustomerResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateCustomer = async (data: CustomerRequest) => {
    try {
        const res = await axiosInstance.put(`/admin/customers/${data.id}`, data);
        return res as unknown as ApiResponse<CustomerResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteCustomer = async (customerId: number) => {
    try {
        const res = await axiosInstance.delete(`/admin/customers/${customerId}`);
        return res as unknown as ApiResponse<null>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const searchCustomers = async (data: PageRequest & { keyword: string }) => {
    try {
        const res = await axiosInstance.get(`/admin/customers/search`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            keyword: data.keyword
        } });
        return res as unknown as ApiResponse<PageResponse<CustomerResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}