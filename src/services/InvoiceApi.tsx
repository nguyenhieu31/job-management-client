import { axiosInstance } from "@/lib/utils/axios-instance";
import { InvoiceResponse, InvoiceRequest } from "@/types/invoices";
import { AxiosResponse } from "axios";

const API_BASE = "/admin/invoices";

export const InvoiceApi = {
  // Get all unpaid and partial payment jobs grouped by customer
  getUnpaidJobs: async (): Promise<AxiosResponse<any>> => {
    return await axiosInstance.get(`${API_BASE}/unpaid-jobs`);
  },

  // Generate invoice from selected jobs
  createInvoice: async (data: InvoiceRequest): Promise<AxiosResponse<InvoiceResponse>> => {
    return await axiosInstance.post(`${API_BASE}/create`, data);
  },

  // Get invoice by ID
  getInvoice: async (id: number): Promise<AxiosResponse<InvoiceResponse>> => {
    return await axiosInstance.get(`${API_BASE}/${id}`);
  },

  // Get all invoices
  getAllInvoices: async (page: number = 1, pageSize: number = 10): Promise<AxiosResponse<any>> => {
    return await axiosInstance.get(`${API_BASE}?page=${page}&pageSize=${pageSize}`);
  },

  // Submit invoice to PayPal
  submitInvoice: async (id: number): Promise<AxiosResponse<any>> => {
    return await axiosInstance.post(`${API_BASE}/${id}/submit`);
  },

  // Cancel invoice
  cancelInvoice: async (id: number): Promise<AxiosResponse<any>> => {
    return await axiosInstance.put(`${API_BASE}/${id}/cancel`);
  },

  // Update invoice
  updateInvoice: async (id: number, data: Partial<InvoiceRequest>): Promise<AxiosResponse<InvoiceResponse>> => {
    return await axiosInstance.put(`${API_BASE}/${id}`, data);
  },
};
