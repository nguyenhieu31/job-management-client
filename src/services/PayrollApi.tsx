import { axiosInstance } from "@/lib/utils/axios-instance";
import { EmployeePayroll } from "@/types/payroll";
import { ApiResponse } from "@/components/types/ApiResponse";

export const getAllPayrollByPeriod = async (period: string) => {
  try {
    const res = await axiosInstance.get(`/admin/payroll/manager`, { params: { period } });
    return res as unknown as ApiResponse<EmployeePayroll[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getPayrollByPeriodAndEmployee = async () => {
  try {
      const res = await axiosInstance.get(`/admin/payroll/employee`);
      return res as unknown as ApiResponse<EmployeePayroll[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updatePayrollStatus = async (data: {payrollId: number; status: string;}) => {
  try {
    const res = await axiosInstance.put(`/admin/payroll/update-status/${data.payrollId}?status=${data.status}`);
    return res as unknown as ApiResponse<EmployeePayroll>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};