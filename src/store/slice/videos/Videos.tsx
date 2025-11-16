import { PageResponse } from "@/components/types/Page";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { VideoRequest, VideoResponse, VideoViewResponse } from "@/types/videos";
import * as VideoApi from "@/services/VideoApi";
import { getVideoFromDropbox } from "@/services/DropboxApi";
import { toast } from "react-toastify";

interface VideoState {
  videos: PageResponse<VideoResponse[]> | undefined;
  video: VideoResponse | undefined;
  videoView: VideoViewResponse[];
  loading: boolean;
  loadingSearching: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: undefined,
  video: undefined,
  videoView: [],
  loading: false,
  loadingSearching: false,
  error: null,
};

export const GetAllVideosAction = createAsyncThunk(
  "video/getAllVideos",
  async (data: { pageNumber: number; pageSize: number }) => {
    const res = await VideoApi.getAllVideos(data);
    return res.data;
  }
);

export const GetAllVideosByAssigneeAction = createAsyncThunk(
  "video/getAllVideosByAssignee",
  async (data: { pageNumber: number; pageSize: number; email: string }) => {
    const res = await VideoApi.getAllVideosByAssignee(data);
    return res.data;
  }
);

export const UpdateVideoStatusAction = createAsyncThunk(
  "video/updateVideoStatus",
  async (data: {
    id: number;
    status: string;
    qaNote?: string;
    qaOutputNumber?: number | null;
  }) => {
    const res = await VideoApi.updateVideoStatus(data);
    return res.data;
  }
);

export const GetRandomVideoAction = createAsyncThunk(
  "video/getRandomVideo",
  async () => {
    const res = await VideoApi.getRandomVideo();
    return res.data;
  }
);

export const GetVideoFromDropboxAction = createAsyncThunk<
  VideoResponse[],
  void
>("GetVideoFromDropboxAction", async () => {
  try {
    const response = await getVideoFromDropbox();
    return response.data as VideoResponse[];
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const SearchVideoByConditionsAction = createAsyncThunk(
  "video/searchVideoByConditions",
  async (data: {
    pageNumber: number;
    pageSize: number;
    keyword: string | null;
    videoStatus: string | null;
    paymentStatus: string | null;
    startDate: string | null;
    endDate: string | null;
    selectedEmployeeIds?: number[];
    selectedCustomerIds?: number[];
  }) => {
    const res = await VideoApi.searchVideoByConditions(data);
    return res.data;
  }
);

export const SearchVideoViewAction = createAsyncThunk(
  "video/searchVideoView",
  async (keyword: string) => {
    const res = await VideoApi.searchVideoView(keyword);
    return res.data;
  }
);

export const UpdateGridViewVideoAction = createAsyncThunk(
  "video/updateGridViewVideo",
  async (data: {
    jobId: number;
    caseName?: string | null;
    note?: string | null;
    assigneeId: number | null;
    customerId: number | null;
    filePrice: number | null;
    inputNumber: number | null;
    outputNumber?: number | null;
    qaOutputNumber?: number | null;
    qualifiedAssigneeId?: number | null;
    paymentStatus?: string | null;
    inputLink?: string | null;
    doneLink?: string | null;
    payPerFile?: number | null;
    payPerFileQa?: number | null;
    isDeleteAssignee?: boolean;
  }) => {
    const res = await VideoApi.updateGridViewVideo(data);
    return res.data;
  }
);

export const CreateVideoAction = createAsyncThunk(
  "video/createVideo",
  async (data: VideoRequest) => {
    const res = await VideoApi.createVideo(data);
    return res.data;
  }
);

export const UpdateVideoFullAction = createAsyncThunk(
  "video/updateVideoFull",
  async (data: VideoRequest) => {
    const res = await VideoApi.updateVideoFull(data);
    return res.data;
  }
);

export const DeleteVideoByIdAction = createAsyncThunk(
  "video/deleteVideoById",
  async (videoId: number) => {
    const res = await VideoApi.deleteVideoById(videoId);
    return res.data;
  }
);

export const DeleteMultipleVideosAction = createAsyncThunk(
  "video/deleteMultipleVideos",
  async (videoIds: number[]) => {
    const res = await VideoApi.deleteMultipleVideos(videoIds);
    return res.data;
  }
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    updateVideo: (state, action) => {
      if (state.videos && state.videos.data) {
        state.videos.data = state.videos.data.map((video) =>
          video.id === action.payload.id ? action.payload : video
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Get All Videos
    builder.addCase(GetAllVideosAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetAllVideosAction.fulfilled, (state, action) => {
      state.loading = false;
      state.videos = action.payload;
    });
    builder.addCase(GetAllVideosAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get videos";
    });

    // Get All Videos By Assignee
    builder.addCase(GetAllVideosByAssigneeAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetAllVideosByAssigneeAction.fulfilled, (state, action) => {
      state.loading = false;
      state.videos = action.payload;
    });
    builder.addCase(GetAllVideosByAssigneeAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get videos by assignee";
    });

    // Update Video Status
    builder.addCase(UpdateVideoStatusAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(UpdateVideoStatusAction.fulfilled, (state) => {
      state.loading = false;
      // Optionally update the video in the list if needed
      toast.success("Cập nhật trạng thái video thành công");
    });
    builder.addCase(UpdateVideoStatusAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update video status";
    });

    // Get Random Video
    builder.addCase(GetRandomVideoAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetRandomVideoAction.fulfilled, (state, action) => {
      state.loading = false;
      state.video = action.payload;
      // Add the random video to the videos list if it doesn't already exist
      if (state.videos && state.videos.data) {
        const exists = state.videos.data.find(
          (video) => video.id === action.payload.id
        );
        if (!exists) {
          state.videos.data.unshift(action.payload);
          // Optionally, you might want to limit the size of the videos array
          if (state.videos.data.length > state.videos.pageSize) {
            state.videos.data.pop();
          }
        }
      } else {
        state.videos = {
          data: [action.payload],
          pageNumber: 1,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
        };
      }
    });
    builder.addCase(GetRandomVideoAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get random video";
    });

    // Search Video By Conditions
    builder.addCase(SearchVideoByConditionsAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      SearchVideoByConditionsAction.fulfilled,
      (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      }
    );
    builder.addCase(SearchVideoByConditionsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to search videos";
    });

    // Search Video View
    builder.addCase(SearchVideoViewAction.pending, (state) => {
      state.loadingSearching = true;
      state.error = null;
    });
    builder.addCase(SearchVideoViewAction.fulfilled, (state, action) => {
      state.loadingSearching = false;
      state.videoView = action.payload;
    });
    builder.addCase(SearchVideoViewAction.rejected, (state, action) => {
      state.loadingSearching = false;
      state.error = action.error.message || "Failed to search video view";
    });

    // Update Grid View Video
    builder.addCase(UpdateGridViewVideoAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(UpdateGridViewVideoAction.fulfilled, (state, action) => {
      state.loading = false;
      if (state.videos && state.videos.data) {
        state.videos.data = state.videos.data.map((video) =>
          video.id === action.payload.id ? action.payload : video
        );
      }
    });
    builder.addCase(UpdateGridViewVideoAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update grid view video";
    });

    // Create Video
    builder.addCase(CreateVideoAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(CreateVideoAction.fulfilled, (state, action) => {
      state.loading = false;
      if (state.videos && state.videos.data) {
        state.videos.data.unshift(action.payload);
        state.videos.totalElements += 1;
        // Optionally, you might want to limit the size of the videos array
        if (state.videos.data.length > state.videos.pageSize) {
          state.videos.data.pop();
        }
      } else {
        state.videos = {
          data: [action.payload],
          pageNumber: 1,
          pageSize: 10,
          totalElements: 1,
          totalPages: 1,
        };
      }
    });
    builder.addCase(CreateVideoAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to create video";
    });

    // Update Video Full
    builder.addCase(UpdateVideoFullAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(UpdateVideoFullAction.fulfilled, (state, action) => {
      state.loading = false;
      if (state.videos && state.videos.data) {
        state.videos.data = state.videos.data.map((video) =>
          video.id === action.payload.id ? action.payload : video
        );
      }
    });
    builder.addCase(UpdateVideoFullAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update video";
    });

    // Delete Video By Id
    builder.addCase(DeleteVideoByIdAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DeleteVideoByIdAction.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(DeleteVideoByIdAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to delete video";
    });

    // Delete Multiple Videos
    builder.addCase(DeleteMultipleVideosAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(DeleteMultipleVideosAction.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(DeleteMultipleVideosAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to delete multiple videos";
    });

    // Get video from Dropbox
    builder.addCase(GetVideoFromDropboxAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetVideoFromDropboxAction.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.length === 0) {
        toast.info("Không có công việc mới nào từ Dropbox");
        return;
      } else {
        toast.success(
          `Đã đồng bộ ${action.payload.length} công việc từ Dropbox`
        );
      }
      if (state.videos && state.videos.data) {
        action.payload.forEach((newJob) => {
          state.videos!.data.unshift(newJob);
          state.videos!.totalElements += 1;
        });
        if (state.videos.data.length > state.videos.pageSize) {
          const countToRemove = state.videos.data.length - state.videos.pageSize;
          for (let i = 0; i < countToRemove; i++) {
            state.videos.data.pop();
          }
        }
      }
    });
    builder.addCase(GetVideoFromDropboxAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to get video from Dropbox";
    });
  },
});

export const { updateVideo } = videoSlice.actions;
export default videoSlice.reducer;
