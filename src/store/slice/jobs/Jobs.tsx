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
  searchJobView,
  updateGridViewJob,
  updateJobFull,
  updateJobStatus,
  updatePaymentEmployeeMultipleJobs,
  updatePaymentMultipleJobs,
} from "@/services/JobApi";
import { EmployeePaymentStatus, JobRequest, JobResponse, JobViewResponse } from "@/types/jobs";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface InitialValuesStyle {
  loading: boolean;
  loadingSearching: boolean;
  message: string;
  jobs: PageResponse<JobResponse[]> | undefined;
  jobView: JobViewResponse[];
  error: string;
}

export const GetAllJobsAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest & {fromDate: string | null;}
>("GetAllJobsAction", async (data: PageRequest & {fromDate: string | null}) => {
  try {
    const response = await getAllJobs(data);
    return response.data as PageResponse<JobResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const GetAllJobsByAssigneeAction = createAsyncThunk<
  PageResponse<JobResponse[]>,
  PageRequest & { email: string; fromDate?: string | null }
>(
  "GetAllJobsByAssigneeAction",
  async (data: PageRequest & { email: string; fromDate?: string | null }) => {
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
  PageRequest & { email: string; fromDate?: string | null }
>(
  "GetAllJobsByQualifiedAssigneeAction",
  async (data: PageRequest & { email: string; fromDate?: string | null }) => {
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
  { id: number; status: string; qaNote?: string; qaOutputNumber?: number | null }
>("UpdateJobStatusAction", async (data: { id: number; status: string; qaNote?: string; qaOutputNumber?: number | null }) => {
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
    qaOutputNumber?: number | null;
    qualifiedAssigneeId: number | null;
    paymentStatus?: string | null;
    paymentEmployee?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
    employeeNote?: string | null;
    isDeleteAssignee?: boolean;
    isDeleteQualifiedAssignee?: boolean;
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
    qaOutputNumber?: number | null;
    qualifiedAssigneeId: number | null;
    paymentStatus?: string | null;
    paymentEmployee?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
    employeeNote?: string | null;
    isDeleteAssignee?: boolean;
    isDeleteQualifiedAssignee?: boolean;
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
    paymentEmployee: string | null;
    startDate: string | null;
    endDate: string | null;
    selectedEmployeeIds?: number[];
    selectedCustomerIds?: number[];
  }
>(
  "SearchJobByConditionsAction",
  async (
    data: PageRequest & {
      keyword: string | null;
      jobStatus: string | null;
      paymentStatus: string | null;
      paymentEmployee: string | null;
      startDate: string | null;
      endDate: string | null;
      selectedEmployeeIds?: number[];
      selectedCustomerIds?: number[];
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

export const SearchJobViewAction = createAsyncThunk<
  JobViewResponse[],
  string
>(
  "SearchJobViewAction",
  async (keyword: string) => {
    try {
      const response = await searchJobView(keyword);
      return response.data as JobViewResponse[];
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const CreateJobAction = createAsyncThunk<JobResponse, { data: JobRequest; images?: File[]; videos?: File[]; imageTempUrls?: string[]; videoTempUrls?: string[] }>(
  "CreateJobAction",
  async ({ data, images, videos, imageTempUrls, videoTempUrls }) => {
    try {
      const response = await createJob(data, images, videos, imageTempUrls, videoTempUrls);
      return response.data as JobResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const UpdateJobAction = createAsyncThunk<JobResponse, { data: JobRequest; images?: File[]; videos?: File[], imageTempUrls?: string[], videoTempUrls?: string[] }>(
  "UpdateJobAction",
  async ({ data, images, videos, imageTempUrls, videoTempUrls }) => {
    try {
      const response = await updateJobFull(data, images, videos, imageTempUrls, videoTempUrls);
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

export const UpdatePaymentEmployeeMultipleJobsAction = createAsyncThunk<void, { ids: number[] }>(
  "UpdatePaymentEmployeeMultipleJobsAction",
  async (data: { ids: number[] }) => {
    try {
      await updatePaymentEmployeeMultipleJobs(data.ids);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

export const UpdatePaymentMultipleJobsAction = createAsyncThunk<void, { ids: number[] }>(
  "UpdatePaymentMultipleJobsAction",
  async (data: { ids: number[] }) => {
    try {
      await updatePaymentMultipleJobs(data.ids);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
);

const initialState: InitialValuesStyle = {
  loading: false,
  loadingSearching: false,
  message: "",
  jobs: undefined,
  error: "",
  jobView: []
};

const JobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    updateJob: (state, action: PayloadAction<JobResponse>) => {
      if (state.jobs && state.jobs.data) {
        const job = state.jobs.data.find((job) => job.id === action.payload.id);
        if (!job) {
          state.jobs.data.unshift(action.payload);
          state.jobs.totalElements += 1;
          if (state.jobs.data.length > state.jobs.pageSize) {
            state.jobs.data.pop();
          }
          return;
        }
        state.jobs.data = state.jobs.data.map((job) =>
          job.id === action.payload.id ? action.payload : job
        );
      }else{
        state.jobs = {
          data: [action.payload],
          pageNumber: 1,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
        };
      }
    },
    createJobRealTime: (state, action: PayloadAction<JobResponse>) => {
      if (state.jobs && state.jobs.data) {
        state.jobs.data.unshift(action.payload);
        state.jobs.totalElements += 1;
        if (state.jobs.data.length > state.jobs.pageSize) {
          state.jobs.data.pop();
        }
      }else{
        state.jobs = {
          data: [action.payload],
          pageNumber: 1,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
        };
      }
    },
    deleteJobByIdRealTime: (state, action: PayloadAction<number>) => {
      if (state.jobs && state.jobs.data) {
        state.jobs.data = state.jobs.data.filter((job) => job.id !== action.payload);
        state.jobs.totalElements -= 1;
      }
    },
    deleteMultipleJobsRealTime: (state, action: PayloadAction<number[]>) => {
      if (state.jobs && state.jobs.data) {
        state.jobs.data = state.jobs.data.filter((job) => !action.payload.includes(job.id));
        state.jobs.totalElements -= action.payload.length;
      }
    },
    updatePaymentEmployeeMultipleJobsRealTime: (state, action) => {
      const jobIds = action.payload.jobIds as number[];
      const status = action.payload.status as EmployeePaymentStatus;
      if (state.jobs && state.jobs.data) {
        state.jobs.data = state.jobs.data.map((job) =>
          jobIds.includes(job.id) ? { ...job, paymentEmployee: status } : job
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
      .addCase(UpdatePaymentEmployeeMultipleJobsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdatePaymentMultipleJobsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(SearchJobViewAction.pending, (state) => {
        state.loadingSearching = true;
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
          toast.success("Cập nhật công việc thành công");
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
          toast.success("Tạo công việc thành công");
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
          toast.success("Cập nhật công việc thành công");
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
      .addCase(UpdatePaymentEmployeeMultipleJobsAction.fulfilled, (state) => {
        state.loading = false;
        toast.success("Cập nhật trạng thái thanh toán cho nhân viên thành công");
      })
      .addCase(UpdatePaymentMultipleJobsAction.fulfilled, (state) => {
        state.loading = false;
        toast.success("Cập nhật trạng thái thanh toán thành công");
      })
      .addCase(SearchJobViewAction.fulfilled, (state, action: PayloadAction<JobViewResponse[]>) => {
        state.loadingSearching = false;
        state.jobView = action.payload;
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
      })
      .addCase(UpdatePaymentEmployeeMultipleJobsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update payment employee multiple jobs failed";
      })
      .addCase(UpdatePaymentMultipleJobsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Update payment multiple jobs failed";
      })
      .addCase(SearchJobViewAction.rejected, (state, action) => {
        state.loadingSearching = false;
        state.error = action.error.message || "Search job view failed";
      });
  },
});

export const { updateJob, createJobRealTime, deleteJobByIdRealTime, deleteMultipleJobsRealTime, updatePaymentEmployeeMultipleJobsRealTime } = JobSlice.actions;
export default JobSlice.reducer;
