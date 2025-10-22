import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InvoiceApi } from "@/services/InvoiceApi";
import { InvoiceResponse, JobsByCustomer } from "@/types/invoices";
import { mockJobsByCustomer, mockInvoice } from "@/lib/mock-data";
import { generateMockInvoice } from "@/hooks/use-invoice-data";

interface InvoicesState {
  jobsByCustomer: JobsByCustomer[];
  currentInvoice: InvoiceResponse | null;
  invoices: InvoiceResponse[];
  loading: boolean;
  error: string | null;
  previewInvoice: InvoiceResponse | null;
}

const initialState: InvoicesState = {
  jobsByCustomer: [],
  currentInvoice: null,
  invoices: [],
  loading: false,
  error: null,
  previewInvoice: null,
};

// Thunks
export const fetchUnpaidJobs = createAsyncThunk(
  "invoices/fetchUnpaidJobs",
  async (_, { rejectWithValue }) => {
    try {
      // Check if using mock data
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockJobsByCustomer;
      }
      
      const response = await InvoiceApi.getUnpaidJobs();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unpaid jobs");
    }
  }
);

export const createInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async (
    data: { jobIds: number[]; customerId: number; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      // Check if using mock data
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockInvoiceData = generateMockInvoice(data.customerId, data.jobIds);
        return mockInvoiceData;
      }
      
      const response = await InvoiceApi.createInvoice(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create invoice");
    }
  }
);

export const submitInvoice = createAsyncThunk(
  "invoices/submitInvoice",
  async (id: number, { rejectWithValue }) => {
    try {
      // Check if using mock data
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          ...mockInvoice,
          status: "PENDING" as const,
          id,
        };
      }
      
      const response = await InvoiceApi.submitInvoice(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit invoice");
    }
  }
);

export const getAllInvoices = createAsyncThunk(
  "invoices/getAllInvoices",
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await InvoiceApi.getAllInvoices(page, pageSize);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch invoices");
    }
  }
);

const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setPreviewInvoice: (state, action) => {
      state.previewInvoice = action.payload;
    },
    clearPreviewInvoice: (state) => {
      state.previewInvoice = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch unpaid jobs
    builder
      .addCase(fetchUnpaidJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnpaidJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobsByCustomer = action.payload;
      })
      .addCase(fetchUnpaidJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.previewInvoice = action.payload;
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Submit invoice
    builder
      .addCase(submitInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
        state.previewInvoice = null;
      })
      .addCase(submitInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get all invoices
    builder
      .addCase(getAllInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data || [];
      })
      .addCase(getAllInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPreviewInvoice, clearPreviewInvoice, clearError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
