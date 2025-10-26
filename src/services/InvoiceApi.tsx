import { ApiResponse } from "@/components/types/ApiResponse";
import { PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { CustomerJobSummary, InvoicePageRequest, InvoiceRequest, InvoiceResponse } from "@/types/invoices";

export const getCustomerJobSummary = async () => {
    try {
        const res = await axiosInstance.get(`/admin/paypal/customer-summary`);
        return res as unknown as ApiResponse<CustomerJobSummary[]>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const getAllInvoice = async (data: InvoicePageRequest) => {
    try {
        const res = await axiosInstance.get(`/admin/paypal/invoices`, { params: data });
        return res as unknown as ApiResponse<PageResponse<InvoiceResponse[]>>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const createInvoice = async (data : InvoiceRequest) => {
    try {
        const res = await axiosInstance.post(`/admin/paypal/create-invoice`, data);
        return res as unknown as ApiResponse<InvoiceResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const sendInvoice = async (invoiceId : string) => {
    try {
        const res = await axiosInstance.post(`/admin/paypal/send-invoice?invoiceId=${invoiceId}`);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const cancelInvoice = async (invoiceId : string) => {
    try {
        const res = await axiosInstance.post(`/admin/paypal/cancel-invoice?invoiceId=${invoiceId}`);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}