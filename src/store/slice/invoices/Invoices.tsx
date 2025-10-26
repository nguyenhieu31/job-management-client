import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CustomerJobSummary, InvoicePageRequest, InvoiceRequest, InvoiceResponse } from "@/types/invoices";
import { cancelInvoice, createInvoice, getAllInvoice, getCustomerJobSummary, sendInvoice } from "@/services/InvoiceApi";
import { PageResponse } from "@/components/types/Page";
import { toast } from "react-toastify";

interface InvoicesState {
  customerJobSummary: CustomerJobSummary[];
  currentInvoice: InvoiceResponse | null;
  invoices: PageResponse<InvoiceResponse[]> | undefined;
  loading: boolean;
  error: string | null;
  previewInvoice: InvoiceResponse | null;
}

const initialState: InvoicesState = {
  customerJobSummary: [],
  currentInvoice: null,
  invoices: undefined,
  loading: false,
  error: null,
  previewInvoice: null,
};

export const GetCustomerJobSummaryAction = createAsyncThunk<
  CustomerJobSummary[],
  void
>("GetCustomerJobSummaryAction", async () => {
  try {
    const response = await getCustomerJobSummary();
    return response.data as CustomerJobSummary[];
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const GetAllInvoicesAction = createAsyncThunk<
  PageResponse<InvoiceResponse[]>,
  InvoicePageRequest
>("GetAllInvoicesAction", async (params) => {
  try {
    const response = await getAllInvoice(params);
    return response.data as PageResponse<InvoiceResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const CreateInvoiceAction = createAsyncThunk<
  InvoiceResponse,
  InvoiceRequest
>("CreateInvoiceAction", async (data: InvoiceRequest) => {
  try {
    const response = await createInvoice(data);
    return response.data as InvoiceResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const SendInvoiceAction = createAsyncThunk<
  string,
  string
>("SendInvoiceAction", async (invoiceId: string) => {
  try {
    const response = await sendInvoice(invoiceId);
    return response.data as string;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const CancelInvoiceAction = createAsyncThunk<
  string,
  string
>("CancelInvoiceAction", async (invoiceId: string) => {
  try {
    const response = await cancelInvoice(invoiceId);
    return response.data as string;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

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
    updateCustomerCreatedInvoice: (state, action) => {
      const updatedCustomer = action.payload;
      state.customerJobSummary = state.customerJobSummary.filter(cj => cj.customer.id !== updatedCustomer.id);
    },
  },
  extraReducers: (builder) => {
    // Fetch unpaid jobs
    builder
      .addCase(GetCustomerJobSummaryAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetCustomerJobSummaryAction.fulfilled, (state, action) => {
        state.loading = false;
        state.customerJobSummary = action.payload;
      })
      .addCase(GetCustomerJobSummaryAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(GetAllInvoicesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllInvoicesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(GetAllInvoicesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(CreateInvoiceAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateInvoiceAction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
        if (state.invoices && state.invoices.data) {
            state.invoices.data.unshift(action.payload);
            state.invoices.totalElements += 1;
            // Optionally, you might want to limit the size of the jobs array
            if (state.invoices.data.length > state.invoices.pageSize) {
              state.invoices.data.pop();
            }
          } else {
            state.invoices = {
              data: [action.payload],
              pageNumber: 1,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
            };
          }
      })
      .addCase(CreateInvoiceAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(SendInvoiceAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SendInvoiceAction.fulfilled, (state) => {
        state.loading = false;
        toast.success("Gửi hoá đơn thành công!");
      })
      .addCase(SendInvoiceAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(CancelInvoiceAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CancelInvoiceAction.fulfilled, (state) => {
        state.loading = false;
        toast.success("Hủy hoá đơn thành công!");
      })
      .addCase(CancelInvoiceAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPreviewInvoice, clearPreviewInvoice, clearError, updateCustomerCreatedInvoice } = invoicesSlice.actions;
export default invoicesSlice.reducer;
