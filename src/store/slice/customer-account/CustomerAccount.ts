import { PageRequest, PageResponse } from "@/components/types/Page";
import {
    createCustomerAccount,
    deleteCustomerAccount,
    getAllCustomerAccounts,
    resetPasswordCustomerAccount,
    searchCustomerAccounts,
    updateCustomerAccount,
} from "@/services/CustomerAccountApi";
import { CustomerAccountRequest, CustomerAccountResponse } from "@/types/customer-accounts";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface InitialValuesStyle {
    loading: boolean;
    message: string;
    customerAccounts: PageResponse<CustomerAccountResponse[]> | undefined;
    error: string;
}

export const GetAllCustomerAccountsAction = createAsyncThunk<
    PageResponse<CustomerAccountResponse[]>,
    PageRequest
>("GetAllCustomerAccountsAction", async (data: PageRequest) => {
    const response = await getAllCustomerAccounts(data);
    return response.data as PageResponse<CustomerAccountResponse[]>;
});

export const SearchCustomerAccountsAction = createAsyncThunk<
    PageResponse<CustomerAccountResponse[]>,
    PageRequest & { keyword?: string }
>("SearchCustomerAccountsAction", async (data) => {
    const response = await searchCustomerAccounts(data);
    return response.data as PageResponse<CustomerAccountResponse[]>;
});

export const CreateCustomerAccountAction = createAsyncThunk<
    CustomerAccountResponse,
    CustomerAccountRequest
>("CreateCustomerAccountAction", async (data) => {
    const response = await createCustomerAccount(data);
    toast.success("Tài khoản khách hàng đã được tạo thành công");
    return response.data as CustomerAccountResponse;
});

export const UpdateCustomerAccountAction = createAsyncThunk<
    CustomerAccountResponse,
    CustomerAccountRequest
>("UpdateCustomerAccountAction", async (data) => {
    const response = await updateCustomerAccount(data);
    toast.success("Tài khoản khách hàng đã được cập nhật thành công");
    return response.data as CustomerAccountResponse;
});

export const DeleteCustomerAccountAction = createAsyncThunk<void, number>(
    "DeleteCustomerAccountAction", async (id) => {
        await deleteCustomerAccount(id);
    }
);

export const ResetPasswordCustomerAccountAction = createAsyncThunk<string, number>(
    "ResetPasswordCustomerAccountAction", async (id) => {
        const response = await resetPasswordCustomerAccount(id);
        toast.success("Mật khẩu đã được đặt lại thành công");
        return response.data as string;
    }
);

const initialState: InitialValuesStyle = {
    loading: false, message: "", customerAccounts: undefined, error: "",
};

const CustomerAccountSlice = createSlice({
    name: "customerAccount",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetAllCustomerAccountsAction.pending, (state) => { state.loading = true; })
            .addCase(CreateCustomerAccountAction.pending, (state) => { state.loading = true; })
            .addCase(ResetPasswordCustomerAccountAction.pending, (state) => { state.loading = true; })
            .addCase(UpdateCustomerAccountAction.pending, (state) => { state.loading = true; })
            .addCase(DeleteCustomerAccountAction.pending, (state) => { state.loading = true; })
            .addCase(SearchCustomerAccountsAction.pending, (state) => { state.loading = true; })
            .addCase(GetAllCustomerAccountsAction.fulfilled, (state, action) => {
                state.loading = false; state.customerAccounts = action.payload;
            })
            .addCase(CreateCustomerAccountAction.fulfilled, (state, action) => {
                state.loading = false;
                if (state.customerAccounts) {
                    state.customerAccounts.data.unshift(action.payload);
                    if (state.customerAccounts.data.length > state.customerAccounts.pageSize)
                        state.customerAccounts.data.pop();
                } else {
                    state.customerAccounts = {
                        data: [action.payload], pageNumber: 1, pageSize: 10, totalElements: 1, totalPages: 1,
                    };
                }
            })
            .addCase(ResetPasswordCustomerAccountAction.fulfilled, (state, action) => {
                state.loading = false; state.message = action.payload;
            })
            .addCase(UpdateCustomerAccountAction.fulfilled, (state, action) => {
                state.loading = false;
                if (state.customerAccounts) {
                    const index = state.customerAccounts.data.findIndex(a => a.id === action.payload.id);
                    if (index !== -1) state.customerAccounts.data[index] = action.payload;
                }
            })
            .addCase(DeleteCustomerAccountAction.fulfilled, (state) => { state.loading = false; })
            .addCase(SearchCustomerAccountsAction.fulfilled, (state, action) => {
                state.loading = false; state.customerAccounts = action.payload;
            })
            .addCase(GetAllCustomerAccountsAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Failed to fetch customer accounts";
            })
            .addCase(CreateCustomerAccountAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Create failed";
            })
            .addCase(ResetPasswordCustomerAccountAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Reset password failed";
            })
            .addCase(UpdateCustomerAccountAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Update failed";
            })
            .addCase(DeleteCustomerAccountAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Delete failed";
            })
            .addCase(SearchCustomerAccountsAction.rejected, (state, action) => {
                state.loading = false; state.error = action.error.message || "Search failed";
            });
    },
});

export default CustomerAccountSlice.reducer;
