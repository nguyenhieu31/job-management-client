import { PageRequest, PageResponse } from "@/components/types/Page";
import {
  createWorkRequest,
  getAllWorkRequests,
  updateWorkRequest,
  deleteWorkRequest,
  searchWorkRequests,
} from "@/services/WorkRequestApi";
import { WorkRequestRequest, WorkRequestResponse } from "@/types/work-requests";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface InitialValuesStyle {
  loading: boolean;
  message: string;
  workRequests: PageResponse<WorkRequestResponse[]> | undefined;
  error: string;
}

export const GetAllWorkRequestsAction = createAsyncThunk<
  PageResponse<WorkRequestResponse[]>,
  PageRequest
>("GetAllWorkRequestsAction", async (data: PageRequest) => {
  try {
    const response = await getAllWorkRequests(data);
    return response.data as PageResponse<WorkRequestResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const SearchWorkRequestsAction = createAsyncThunk<
  PageResponse<WorkRequestResponse[]>,
  PageRequest & { keyword: string }
>("SearchWorkRequestsAction", async (data: PageRequest & { keyword: string }) => {
  try {
    const response = await searchWorkRequests(data);
    return response.data as PageResponse<WorkRequestResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const CreateWorkRequestAction = createAsyncThunk<
  WorkRequestResponse,
  WorkRequestRequest
>("CreateWorkRequestAction", async (data: WorkRequestRequest) => {
  try {
    const response = await createWorkRequest(data);
    return response.data as WorkRequestResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const UpdateWorkRequestAction = createAsyncThunk<
  WorkRequestResponse,
  WorkRequestRequest
>("UpdateWorkRequestAction", async (data: WorkRequestRequest) => {
  try {
    const response = await updateWorkRequest(data);
    return response.data as WorkRequestResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const DeleteWorkRequestAction = createAsyncThunk<
  void,
  number
>("DeleteWorkRequestAction", async (id: number) => {
  try {
    await deleteWorkRequest(id);
  } catch (err: any) {
    throw new Error(err.message);
  }
});

const initialState: InitialValuesStyle = {
  loading: false,
  message: "",
  workRequests: undefined,
  error: "",
};

const WorkRequestSlice = createSlice({
  name: "workRequest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetAllWorkRequestsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchWorkRequestsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateWorkRequestAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateWorkRequestAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteWorkRequestAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetAllWorkRequestsAction.fulfilled,
        (state, action: PayloadAction<PageResponse<WorkRequestResponse[]>>) => {
          state.loading = false;
          state.workRequests = action.payload;
        }
      )
      .addCase(
        SearchWorkRequestsAction.fulfilled,
        (state, action: PayloadAction<PageResponse<WorkRequestResponse[]>>) => {
          state.loading = false;
          state.workRequests = action.payload;
        }
      )
      .addCase(
        CreateWorkRequestAction.fulfilled,
        (state, action: PayloadAction<WorkRequestResponse>) => {
          state.loading = false;
          state.message = "Tạo yêu cầu công việc thành công";
          if (state.workRequests) {
            state.workRequests.data.unshift(action.payload);
            if (state.workRequests.data.length > state.workRequests.pageSize) {
              state.workRequests.data.pop();
            }
          } else {
            state.workRequests = {
              data: [action.payload],
              pageNumber: 1,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
            };
          }
        }
      )
      .addCase(
        UpdateWorkRequestAction.fulfilled,
        (state, action: PayloadAction<WorkRequestResponse>) => {
          state.loading = false;
          state.message = "Cập nhật yêu cầu công việc thành công";
          if (state.workRequests) {
            const index = state.workRequests.data.findIndex(
              (wr) => wr.id === action.payload.id
            );
            if (index !== -1) {
              state.workRequests.data[index] = action.payload;
            }
          }
        }
      )
      .addCase(DeleteWorkRequestAction.fulfilled, (state) => {
        state.loading = false;
        state.message = "Xóa yêu cầu công việc thành công";
      })
      .addCase(GetAllWorkRequestsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get all work requests failed";
      })
      .addCase(SearchWorkRequestsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Search work requests failed";
      })
      .addCase(CreateWorkRequestAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Create work request failed";
      })
      .addCase(UpdateWorkRequestAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update work request failed";
      })
      .addCase(DeleteWorkRequestAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Delete work request failed";
      });
  },
});

export default WorkRequestSlice.reducer;
