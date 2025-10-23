import { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance } from "@/lib/utils/axios-instance";
import { PayrollPeriod } from "@/types/payrollPeriod";

export const getAllPayrollPeriod = async () => {
  try {
    const res = await axiosInstance.get(`/admin/payroll-periods`);
    return res as unknown as ApiResponse<PayrollPeriod[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};