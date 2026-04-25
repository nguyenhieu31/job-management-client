import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EmployeePayroll, PayrollSummary } from "@/types/payroll";
import { getAllPayrollByPeriod, getPayrollByPeriodAndEmployee, updatePayrollStatus } from "@/services/PayrollApi";

interface PayrollsState {
  payrolls: EmployeePayroll[];
  currentPayroll: EmployeePayroll | null;
  summary: PayrollSummary | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: string;
  periods: string[];
}

const initialState: PayrollsState = {
  payrolls: [],
  currentPayroll: null,
  summary: null,
  loading: false,
  error: null,
  selectedPeriod: new Date().toISOString().slice(0, 7), // "2024-10"
  periods: [],
};


export const GetAllPayrollByPeriodAction = createAsyncThunk<
  EmployeePayroll[],
  string
>(
  "GetAllPayrollByPeriodAction",
  async (period: string) => {
    try {
      const response = await getAllPayrollByPeriod(period);
      return response.data as EmployeePayroll[];
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);


export const GetPayrollByEmployeeAction = createAsyncThunk<
  EmployeePayroll[],
  void
>(
  "GetPayrollByEmployeeAction",
  async () => {
    try {
      const response = await getPayrollByPeriodAndEmployee();
      return response.data as EmployeePayroll[];
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);


export const UpdatePayrollStatusAction = createAsyncThunk<
  EmployeePayroll,
  { payrollId: number; status: string, sepayId?: number }
>(
  "UpdatePayrollStatusAction",
  async (data: { payrollId: number; status: string, sepayId?: number }) => {
    try {
      const response = await updatePayrollStatus(data);
      return response.data as EmployeePayroll;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetAllPayrollByPeriodAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdatePayrollStatusAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetPayrollByEmployeeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetAllPayrollByPeriodAction.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
        state.summary = {
          totalEmployees: action.payload.length,
          totalAmount: action.payload.reduce((sum, p) => sum + p.totalAmount, 0),
          approvedAmount: action.payload.reduce((sum, p) => sum + (p.payrollStatus === "APPROVED" ? p.totalAmount : 0), 0),
          paidAmount: action.payload.reduce((sum, p) => sum + (p.payrollStatus === "PAID" ? p.totalAmount : 0), 0),
          pendingAmount: action.payload.reduce((sum, p) => sum + (p.payrollStatus === "PENDING" ? p.totalAmount : 0), 0),
          averageSalary: action.payload.length > 0 ? action.payload.reduce((sum, p) => sum + p.totalAmount, 0) / action.payload.length : 0
        }
      })
      .addCase(UpdatePayrollStatusAction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payrolls.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
        state.summary = {
          totalEmployees: state.payrolls.length,
          totalAmount: state.payrolls.reduce((sum, p) => sum + p.totalAmount, 0),
          approvedAmount: state.payrolls.reduce((sum, p) => sum + (p.payrollStatus === "APPROVED" ? p.totalAmount : 0), 0),
          paidAmount: state.payrolls.reduce((sum, p) => sum + (p.payrollStatus === "PAID" ? p.totalAmount : 0), 0),
          pendingAmount: state.payrolls.reduce((sum, p) => sum + (p.payrollStatus === "PENDING" ? p.totalAmount : 0), 0),
          averageSalary: state.payrolls.length > 0 ? state.payrolls.reduce((sum, p) => sum + p.totalAmount, 0) / state.payrolls.length : 0
        }
      })
      .addCase(GetPayrollByEmployeeAction.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(GetAllPayrollByPeriodAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi lấy dữ liệu bảng lương";
      })
      .addCase(UpdatePayrollStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi cập nhật trạng thái bảng lương";
      })
      .addCase(GetPayrollByEmployeeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi lấy dữ liệu bảng lương nhân viên";
      });
  },
});

export const { setSelectedPeriod, clearError } = payrollSlice.actions;
export default payrollSlice.reducer;
