import { PageRequest, PageResponse } from "@/components/types/Page";
import { getJobFromDropbox } from "@/services/DropboxApi";
import {
  createJob,
  deleteJobById,
  deleteMultipleJobs,
  getAllJobs,
  getAllJobsByAssignee,
  getAllJobsByQualifiedAssignee,
  getRandomJob,
  searchJobByConditions,
  updateGridViewJob,
  updateJobFull,
  updateJobStatus,
} from "@/services/JobApi";
import { JobRequest, JobResponse } from "@/types/jobs";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface InitialValuesStyle {
  loading: boolean;
  message: string;
  jobs: PageResponse<JobResponse[]> | undefined;
  error: string;
}

export const GetAllJobsAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest
>("GetAllJobsAction", async (data: PageRequest) => {
  try {
    const response = await getAllJobs(data);
    return response.data as PageResponse<JobResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const GetAllJobsByAssigneeAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest & { email: string }
>(
  "GetAllJobsByAssigneeAction",
  async (data: PageRequest & { email: string }) => {
    try {
      const response = await getAllJobsByAssignee(data);
      return response.data as PageResponse<JobResponse[]>;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const GetAllJobsByQualifiedAssigneeAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest & { email: string }
>(
  "GetAllJobsByQualifiedAssigneeAction",
  async (data: PageRequest & { email: string }) => {
    try {
      const response = await getAllJobsByQualifiedAssignee(data);
      return response.data as PageResponse<JobResponse[]>;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const UpdateJobStatusAction = createAsyncThunk<
  string,
  { id: number; status: string; qaNote?: string }
>("UpdateJobStatusAction", async (data: { id: number; status: string; qaNote?: string }) => {
  try {
    const response = await updateJobStatus(data);
    return response.data as string;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const UpdateGridViewJobAction = createAsyncThunk<
  JobResponse,
  {
    jobId: number;
    assigneeId: number | null;
    customerId: number | null;
    filePrice: number | null;
    inputNumber: number | null;
    outputNumber?: number | null;
    qualifiedAssigneeId: number | null;
    paymentStatus?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
  }
>(
  "UpdateGridViewJobAction",
  async (data: {
    jobId: number;
    assigneeId: number | null;
    customerId: number | null;
    filePrice: number | null;
    inputNumber: number | null;
    outputNumber?: number | null;
    qualifiedAssigneeId: number | null;
    paymentStatus?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
  }) => {
    try {
      const response = await updateGridViewJob(data);
      return response.data as JobResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const GetRandomJobAction = createAsyncThunk<JobResponse, void>(
  "GetRandomJobAction",
  async () => {
    try {
      const response = await getRandomJob();
      return response.data as JobResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const GetJobFromDropboxAction = createAsyncThunk<JobResponse[], void>(
  "GetJobFromDropboxAction",
  async () => {
    try {
      const response = await getJobFromDropbox();
      return response.data as JobResponse[];
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const SearchJobByConditionsAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest & {
    keyword: string | null;
    jobStatus: string | null;
    paymentStatus: string | null;
    startDate: string | null;
    endDate: string | null;
  }
>(
  "SearchJobByConditionsAction",
  async (
    data: PageRequest & {
      keyword: string | null;
      jobStatus: string | null;
      paymentStatus: string | null;
      startDate: string | null;
      endDate: string | null;
    }
  ) => {
    try {
      const response = await searchJobByConditions(data);
      return response.data as PageResponse<JobResponse[]>;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const CreateJobAction = createAsyncThunk<JobResponse, JobRequest>(
  "CreateJobAction",
  async (data: JobRequest) => {
    try {
      const response = await createJob(data);
      return response.data as JobResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const UpdateJobAction = createAsyncThunk<JobResponse, JobRequest>(
  "UpdateJobAction",
  async (data: JobRequest) => {
    try {
      const response = await updateJobFull(data);
      return response.data as JobResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const DeleteJobByIdAction = createAsyncThunk<void, { id: number }>(
  "DeleteJobByIdAction",
  async (data: { id: number }) => {
    try {
      await deleteJobById(data.id);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const DeleteMultipleJobsAction = createAsyncThunk<void, { ids: number[] }>(
  "DeleteMultipleJobsAction",
  async (data: { ids: number[] }) => {
    try {
      await deleteMultipleJobs(data.ids);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

const initialState: InitialValuesStyle = {
  loading: false,
  message: "",
  jobs: undefined,
  error: "",
};

const JobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    updateJob: (state, action: PayloadAction<JobResponse>) => {
      if (state.jobs && state.jobs.data) {
        state.jobs.data = state.jobs.data.map((job) =>
          job.id === action.payload.id ? action.payload : job
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetAllJobsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetAllJobsByAssigneeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetAllJobsByQualifiedAssigneeAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateJobStatusAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetRandomJobAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchJobByConditionsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateGridViewJobAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateJobAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateJobAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetJobFromDropboxAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteJobByIdAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteMultipleJobsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        GetAllJobsAction.fulfilled,
        (state, action: PayloadAction<PageResponse<JobResponse[]>>) => {
          state.loading = false;
          state.jobs = action.payload;
        }
      )
      .addCase(
        GetAllJobsByAssigneeAction.fulfilled,
        (state, action: PayloadAction<PageResponse<JobResponse[]>>) => {
          state.loading = false;
          state.jobs = action.payload;
        }
      )
      .addCase(
        GetAllJobsByQualifiedAssigneeAction.fulfilled,
        (state, action: PayloadAction<PageResponse<JobResponse[]>>) => {
          state.loading = false;
          state.jobs = action.payload;
        }
      )
      .addCase(
        UpdateJobStatusAction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.message = action.payload;
          toast.success("Cập nhật trạng thái công việc thành công");
        }
      )
      .addCase(
        GetRandomJobAction.fulfilled,
        (state, action: PayloadAction<JobResponse>) => {
          state.loading = false;
          // Add the random job to the jobs list if it doesn't already exist
          if (state.jobs && state.jobs.data) {
            const exists = state.jobs.data.find(
              (job) => job.id === action.payload.id
            );
            if (!exists) {
              state.jobs.data.unshift(action.payload);
              // Optionally, you might want to limit the size of the jobs array
              if (state.jobs.data.length > state.jobs.pageSize) {
                state.jobs.data.pop();
              }
            }
          } else {
            state.jobs = {
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
        SearchJobByConditionsAction.fulfilled,
        (state, action: PayloadAction<PageResponse<JobResponse[]>>) => {
          state.loading = false;
          state.jobs = action.payload;
        }
      )
      .addCase(
        UpdateGridViewJobAction.fulfilled,
        (state, action: PayloadAction<JobResponse>) => {
          state.loading = false;
          if (state.jobs && state.jobs.data) {
            state.jobs.data = state.jobs.data.map((job) =>
              job.id === action.payload.id ? action.payload : job
            );
          }
        }
      )
      .addCase(
        CreateJobAction.fulfilled,
        (state, action: PayloadAction<JobResponse>) => {
          state.loading = false;
          if (state.jobs && state.jobs.data) {
            state.jobs.data.unshift(action.payload);
            state.jobs.totalElements += 1;
            // Optionally, you might want to limit the size of the jobs array
            if (state.jobs.data.length > state.jobs.pageSize) {
              state.jobs.data.pop();
            }
          } else {
            state.jobs = {
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
        UpdateJobAction.fulfilled,
        (state, action: PayloadAction<JobResponse>) => {
          state.loading = false;
          if (state.jobs && state.jobs.data) {
            state.jobs.data = state.jobs.data.map((job) =>
              job.id === action.payload.id ? action.payload : job
            );
          }
        }
      )
      .addCase(GetJobFromDropboxAction.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length === 0) {
          toast.info("Không có công việc mới nào từ Dropbox");
          return;
        }else{
          toast.success(`Đã đồng bộ ${action.payload.length} công việc từ Dropbox`);
        }
        if (state.jobs && state.jobs.data) {
          action.payload.forEach((newJob) => {
            state.jobs!.data.unshift(newJob);
            state.jobs!.totalElements += 1;
          });
          if (state.jobs.data.length > state.jobs.pageSize) {
            const countToRemove = state.jobs.data.length - state.jobs.pageSize;
            for (let i = 0; i < countToRemove; i++) {
              state.jobs.data.pop();
            }
          }
        }
      })
      .addCase(DeleteJobByIdAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(DeleteMultipleJobsAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(GetAllJobsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get all jobs failed";
      })
      .addCase(GetAllJobsByAssigneeAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get all jobs by assignee failed";
      })
      .addCase(
        GetAllJobsByQualifiedAssigneeAction.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message || "Get all jobs by qualified assignee failed";
        }
      )
      .addCase(UpdateJobStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update job status failed";
      })
      .addCase(GetRandomJobAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get random job failed";
      })
      .addCase(SearchJobByConditionsAction.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Search jobs by conditions failed";
      })
      .addCase(UpdateGridViewJobAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update grid view job failed";
      })
      .addCase(CreateJobAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Create job failed";
      })
      .addCase(UpdateJobAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update job failed";
      })
      .addCase(GetJobFromDropboxAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Get job from Dropbox failed";
      })
      .addCase(DeleteJobByIdAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Delete job failed";
      })
      .addCase(DeleteMultipleJobsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Delete multiple jobs failed";
      });
  },
});

export const { updateJob } = JobSlice.actions;
export default JobSlice.reducer;
