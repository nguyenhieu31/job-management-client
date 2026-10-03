import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getDashboardSummary,
  getJobsByStatus,
  getVideosByStatus,
  getRevenue,
  getJobsByEmployee,
  getVideosByEmployee,
} from "@/services/OverviewApi";
import {
  OverviewDashboardResponse,
  StatusCountStatsResponse,
  RevenueStatsResponse,
  EmployeeStatsResponse,
  TimePeriod,
} from "@/types/overview";

// ─────────────────────────────── State ────────────────────────────────────
interface OverviewState {
  loading: boolean;
  dashboardData: OverviewDashboardResponse | null;
  jobStatusData: StatusCountStatsResponse | null;
  videoStatusData: StatusCountStatsResponse | null;
  jobEmployeeData: EmployeeStatsResponse | null;
  videoEmployeeData: EmployeeStatsResponse | null;
  revenueData: RevenueStatsResponse | null;
  error: string | null;
}

const initialState: OverviewState = {
  loading: false,
  dashboardData: null,
  jobStatusData: null,
  videoStatusData: null,
  jobEmployeeData: null,
  videoEmployeeData: null,
  revenueData: null,
  error: null,
};

// ──────────────────────────── Async Thunks ────────────────────────────────

export const fetchOverviewDashboard = createAsyncThunk<
  OverviewDashboardResponse,
  void
>("overview/fetchDashboard", async () => {
  const res = await getDashboardSummary();
  return res.data as OverviewDashboardResponse;
});

export const fetchJobStatusStats = createAsyncThunk<
  StatusCountStatsResponse,
  { fromDate: string; toDate?: string }
>("overview/fetchJobStatusStats", async ({ fromDate, toDate }) => {
  const res = await getJobsByStatus(fromDate, toDate);
  return res.data as StatusCountStatsResponse;
});

export const fetchVideoStatusStats = createAsyncThunk<
  StatusCountStatsResponse,
  { fromDate: string; toDate?: string }
>("overview/fetchVideoStatusStats", async ({ fromDate, toDate }) => {
  const res = await getVideosByStatus(fromDate, toDate);
  return res.data as StatusCountStatsResponse;
});

export const fetchRevenueStats = createAsyncThunk<
  RevenueStatsResponse,
  { period: TimePeriod; year?: number }
>("overview/fetchRevenueStats", async ({ period, year }) => {
  const res = await getRevenue(period, year);
  return res.data as RevenueStatsResponse;
});

export const fetchJobEmployeeStats = createAsyncThunk<
  EmployeeStatsResponse,
  { fromDate: string; toDate?: string; employeeIds?: number[] }
>("overview/fetchJobEmployeeStats", async ({ fromDate, toDate, employeeIds }) => {
  const res = await getJobsByEmployee(fromDate, toDate, employeeIds);
  return res.data as EmployeeStatsResponse;
});

export const fetchVideoEmployeeStats = createAsyncThunk<
  EmployeeStatsResponse,
  { fromDate: string; toDate?: string; employeeIds?: number[] }
>("overview/fetchVideoEmployeeStats", async ({ fromDate, toDate, employeeIds }) => {
  const res = await getVideosByEmployee(fromDate, toDate, employeeIds);
  return res.data as EmployeeStatsResponse;
});

// ────────────────────────────────  Slice  ─────────────────────────────────

const overviewSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {
    clearOverviewError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchOverviewDashboard
    builder
      .addCase(fetchOverviewDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOverviewDashboard.fulfilled,
        (state, action: PayloadAction<OverviewDashboardResponse>) => {
          state.loading = false;
          state.dashboardData = action.payload;
          // Pre-seed chart data from dashboard summary defaults
          if (action.payload.jobsByStatus) {
            state.jobStatusData = {
              period: "CURRENT_MONTH",
              selectedYear: new Date().getFullYear(),
              countsByStatus: action.payload.jobsByStatus,
            };
          }
          if (action.payload.videosByStatus) {
            state.videoStatusData = {
              period: "CURRENT_MONTH",
              selectedYear: new Date().getFullYear(),
              countsByStatus: action.payload.videosByStatus,
            };
          }
          if (action.payload.revenueStats) {
            state.revenueData = action.payload.revenueStats;
          }
        }
      )
      .addCase(fetchOverviewDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load dashboard";
      });

    // fetchJobStatusStats
    builder
      .addCase(fetchJobStatusStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchJobStatusStats.fulfilled,
        (state, action: PayloadAction<StatusCountStatsResponse>) => {
          state.loading = false;
          state.jobStatusData = action.payload;
        }
      )
      .addCase(fetchJobStatusStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load job status stats";
      });

    // fetchVideoStatusStats
    builder
      .addCase(fetchVideoStatusStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVideoStatusStats.fulfilled,
        (state, action: PayloadAction<StatusCountStatsResponse>) => {
          state.loading = false;
          state.videoStatusData = action.payload;
        }
      )
      .addCase(fetchVideoStatusStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load video status stats";
      });

    // fetchRevenueStats
    builder
      .addCase(fetchRevenueStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRevenueStats.fulfilled,
        (state, action: PayloadAction<RevenueStatsResponse>) => {
          state.loading = false;
          state.revenueData = action.payload;
        }
      )
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load revenue stats";
      });

    // fetchJobEmployeeStats
    builder
      .addCase(fetchJobEmployeeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchJobEmployeeStats.fulfilled,
        (state, action: PayloadAction<EmployeeStatsResponse>) => {
          state.loading = false;
          state.jobEmployeeData = action.payload;
        }
      )
      .addCase(fetchJobEmployeeStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load job employee stats";
      });

    // fetchVideoEmployeeStats
    builder
      .addCase(fetchVideoEmployeeStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchVideoEmployeeStats.fulfilled,
        (state, action: PayloadAction<EmployeeStatsResponse>) => {
          state.loading = false;
          state.videoEmployeeData = action.payload;
        }
      )
      .addCase(fetchVideoEmployeeStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to load video employee stats";
      });
  },
});

export const { clearOverviewError } = overviewSlice.actions;
export default overviewSlice.reducer;
