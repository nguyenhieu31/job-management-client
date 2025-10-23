import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PayrollPeriod } from "@/types/payrollPeriod";
import { getAllPayrollPeriod } from "@/services/PayrollPeriodApi";

interface PayrollPeriodState {
  payrollPeriods: PayrollPeriod[];
  loading: boolean;
  error: string | null;
}

const initialState: PayrollPeriodState = {
  payrollPeriods: [],
  loading: false,
  error: null,
};



export const GetAllPayrollPeriodAction = createAsyncThunk<
  PayrollPeriod[],
  void
>(
  "GetAllPayrollPeriodAction",
  async () => {
    try {
      const response = await getAllPayrollPeriod();
      return response.data as PayrollPeriod[];
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);



const payrollPeriodSlice = createSlice({
  name: "payrollPeriod",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
      builder
      .addCase(GetAllPayrollPeriodAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetAllPayrollPeriodAction.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollPeriods = action.payload;
      })
      .addCase(GetAllPayrollPeriodAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Lỗi khi lấy dữ liệu bảng lương";
      });
  },
});

export default payrollPeriodSlice.reducer;

