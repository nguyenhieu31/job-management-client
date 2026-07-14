import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { CustomerResponse, CustomerRequest } from "@/types/customers";
import { EmployeeResponse } from "@/types/employees";

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

export const searchCustomers = async (data: PageRequest & { keyword: string } & { saleId?: number }) => {
    try {
        const params: any = {
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
        };
        if (data.keyword) params.keyword = data.keyword;
        if (data.saleId) params.saleId = data.saleId;
        const res = await axiosInstance.get(`/admin/customers/search`, { params });
        return res as unknown as ApiResponse<PageResponse<CustomerResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getSalesForDropdown = async () => {
    try {
        const res = await axiosInstance.get(`/admin/employees/sales`);
        return res as unknown as ApiResponse<EmployeeResponse[]>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}
