import { PageRequest, PageResponse } from "@/components/types/Page";
import { createEmployee, deleteEmployee, getAllEmployees, resetPasswordEmployee, searchEmployees, updateEmployee } from "@/services/EmployeeApi";
import { EmployeeRequest, EmployeeResponse } from "@/types/employees";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialValuesStyle {
  loading: boolean;
  message: string;
  employees: PageResponse<EmployeeResponse[]> | undefined;
  error: string;
}

export const GetAllEmployeesAction = createAsyncThunk<
  PageResponse<EmployeeResponse[]>,
  PageRequest
>("GetAllEmployeesAction", async (data: PageRequest) => {
  try {
    const response = await getAllEmployees(data);
    return response.data as PageResponse<EmployeeResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const SearchEmployeesAction = createAsyncThunk<
  PageResponse<EmployeeResponse[]>,
  PageRequest & { keyword: string }
>("SearchEmployeesAction", async (data: PageRequest & { keyword: string }) => {
  try {
    const response = await searchEmployees(data);
    return response.data as PageResponse<EmployeeResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const CreateEmployeeAction = createAsyncThunk<
  EmployeeResponse,
  EmployeeRequest
>("CreateEmployeeAction", async (data: EmployeeRequest) => {
  try {
    const response = await createEmployee(data);
    return response.data as EmployeeResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const UpdateEmployeeAction = createAsyncThunk<
  EmployeeResponse,
  EmployeeRequest
>("UpdateEmployeeAction", async (data: EmployeeRequest) => {
  try {
    const response = await updateEmployee(data);
    return response.data as EmployeeResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const DeleteEmployeeAction = createAsyncThunk<
  void,
  number
>("DeleteEmployeeAction", async (id: number) => {
  try {
    await deleteEmployee(id);
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const ResetPasswordEmployeeAction = createAsyncThunk<
  string,
  number
>("ResetPasswordEmployeeAction", async (id: number) => {
  try {
    const response = await resetPasswordEmployee(id);
    return response.data as string;
  } catch (err: any) {
    throw new Error(err.message);
  }
});


const initialState: InitialValuesStyle = {
  loading: false,
  message: "",
  employees: undefined,
  error: "",
};

const EmployeesSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllEmployeesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateEmployeeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(ResetPasswordEmployeeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateEmployeeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteEmployeeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchEmployeesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetAllEmployeesAction.fulfilled,
        (state, action: PayloadAction<PageResponse<EmployeeResponse[]>>) => {
          state.loading = false;
          state.employees = action.payload;
        }
      )
      .addCase(CreateEmployeeAction.fulfilled, (state, action: PayloadAction<EmployeeResponse>) => {
        state.loading = false;
        state.message = "Employee created successfully";
        if (state.employees) {
          state.employees.data.unshift(action.payload);
          if (state.employees.data.length > state.employees.pageSize) {
            state.employees.data.pop();
          }
        }else{
          state.employees = {
            data: [action.payload],
            pageNumber: 1,
            pageSize: 10,
            totalElements: 1,
            totalPages: 1,
          };
        }
      })
      .addCase(ResetPasswordEmployeeAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(UpdateEmployeeAction.fulfilled, (state, action: PayloadAction<EmployeeResponse>) => {
        state.loading = false;
        state.message = "Employee updated successfully";
        if (state.employees) {
          const index = state.employees.data.findIndex(emp => emp.id === action.payload.id);
          if (index !== -1) {
            state.employees.data[index] = action.payload;
          }
        }
      })
      .addCase(DeleteEmployeeAction.fulfilled, (state) => {
        state.loading = false;
        state.message = "Employee deleted successfully";
      })
      .addCase(SearchEmployeesAction.fulfilled, (state, action: PayloadAction<PageResponse<EmployeeResponse[]>>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(GetAllEmployeesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get all employees failed";
      })
      .addCase(CreateEmployeeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Create employee failed";
      })
      .addCase(ResetPasswordEmployeeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Reset password failed";
      })
      .addCase(UpdateEmployeeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update employee failed";
      })
      .addCase(DeleteEmployeeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Delete employee failed";
      })
      .addCase(SearchEmployeesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Search employees failed";
      });
  },
});

export default EmployeesSlice.reducer;
