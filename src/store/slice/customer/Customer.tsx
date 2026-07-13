import { PageRequest, PageResponse } from "@/components/types/Page";
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from "@/services/CustomerApi";
import { CustomerResponse, CustomerRequest } from "@/types/customers";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialValuesStyle {
  loading: boolean;
  message: string;
  customers: PageResponse<CustomerResponse[]> | undefined;
  error: string;
}

export const GetAllCustomersAction = createAsyncThunk<
  PageResponse<CustomerResponse[]>,
  PageRequest
>("GetAllCustomersAction", async (data: PageRequest) => {
  try {
    const response = await getAllCustomers(data);
    return response.data as PageResponse<CustomerResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const SearchCustomersAction = createAsyncThunk<
  PageResponse<CustomerResponse[]>,
  PageRequest & { keyword: string; assignedSaleId?: number }
>("SearchCustomersAction", async (data: PageRequest & { keyword: string; assignedSaleId?: number }) => {
  try {
    const response = await searchCustomers(data);
    return response.data as PageResponse<CustomerResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const CreateCustomerAction = createAsyncThunk<
  CustomerResponse,
  CustomerRequest
>("CreateCustomerAction", async (data: CustomerRequest) => {
  try {
    const response = await createCustomer(data);
    return response.data as CustomerResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const UpdateCustomerAction = createAsyncThunk<
  CustomerResponse,
  CustomerRequest
>("UpdateCustomerAction", async (data: CustomerRequest) => {
  try {
    const response = await updateCustomer(data);
    return response.data as CustomerResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const DeleteCustomerAction = createAsyncThunk<
  void,
  number
>("DeleteCustomerAction", async (id: number) => {
  try {
    await deleteCustomer(id);
  } catch (err: any) {
    throw new Error(err.message);
  }
});

const initialState: InitialValuesStyle = {
  loading: false,
  message: "",
  customers: undefined,
  error: "",
};

const CustomerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllCustomersAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateCustomerAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateCustomerAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteCustomerAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchCustomersAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetAllCustomersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<CustomerResponse[]>>) => {
          state.loading = false;
          state.customers = action.payload;
        }
      )
      .addCase(CreateCustomerAction.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.loading = false;
        state.message = "Tạo khách hàng thành công";
        if (state.customers) {
          state.customers.data.unshift(action.payload);
          if (state.customers.data.length > state.customers.pageSize) {
            state.customers.data.pop();
          }
        } else {
          state.customers = {
            data: [action.payload],
            pageNumber: 0,
            pageSize: 16,
            totalElements: 1,
            totalPages: 1,
          };
        }
      })
      .addCase(UpdateCustomerAction.fulfilled, (state, action: PayloadAction<CustomerResponse>) => {
        state.loading = false;
        state.message = "Cập nhật khách hàng thành công";
        if (state.customers) {
          const index = state.customers.data.findIndex((c) => c.id === action.payload.id);
          if (index !== -1) {
            state.customers.data[index] = action.payload;
          }
        }
      })
      .addCase(DeleteCustomerAction.fulfilled, (state) => {
        state.loading = false;
        state.message = "Xóa khách hàng thành công";
      })
      .addCase(GetAllCustomersAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })
      .addCase(CreateCustomerAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })
      .addCase(UpdateCustomerAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })
      .addCase(DeleteCustomerAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })
      .addCase(SearchCustomersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<CustomerResponse[]>>) => {
          state.loading = false;
          state.customers = action.payload;
        }
      )
      .addCase(SearchCustomersAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      });
  },
});

export default CustomerSlice.reducer;
