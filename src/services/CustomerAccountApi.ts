import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { CustomerAccountRequest, CustomerAccountResponse } from "@/types/customer-accounts";

export const getAllCustomerAccounts = async (data: PageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/customer-accounts`, { params: {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize
        } });
        return res as unknown as ApiResponse<PageResponse<CustomerAccountResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createCustomerAccount = async (data: CustomerAccountRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/customer-accounts/create`, data);
        return res as unknown as ApiResponse<CustomerAccountResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const updateCustomerAccount = async (data: CustomerAccountRequest) => {
    try {
        const res = await axiosInstance.put(`/admin/customer-accounts/${data.id}`, data);
        return res as unknown as ApiResponse<CustomerAccountResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const resetPasswordCustomerAccount = async (id: number) => {
    try {
        const res = await axiosInstance.put(`/admin/customer-accounts/reset-password/${id}`);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const deleteCustomerAccount = async (id: number) => {
    try {
        const res = await axiosInstance.delete(`/admin/customer-accounts/${id}`);
        return res as unknown as ApiResponse<null>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const searchCustomerAccounts = async (data: PageRequest & { keyword?: string }) => {
    try {
        const params: any = { pageNumber: data.pageNumber, pageSize: data.pageSize };
        if (data.keyword) params.keyword = data.keyword;
        const res = await axiosInstance.get(`/admin/customer-accounts/search`, { params });
        return res as unknown as ApiResponse<PageResponse<CustomerAccountResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}
