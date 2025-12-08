import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Notification } from "@/types/notifications";
import { 
  getAllNotifications, 
  readNotificationByIdAndAccountId, 
  readAllNotificationsByIdsAndAccountId, 
  deleteNotification,
  createNotification
} from "@/services/NotificationApi";
import { PageResponse } from "@/components/types/Page";

interface NotificationState {
  notifications: PageResponse<Notification[]> | undefined;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalCount: number;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: NotificationState = {
  notifications: undefined,
  unreadCount: 0,
  loading: false,
  error: null,
  totalCount: 0,
  pagination: {
    currentPage: 0,
    pageSize: 10,
    totalPages: 0,
  },
};

export const FetchNotificationsAction = createAsyncThunk(
  "notification/fetchNotifications",
  async ({ page = 0, size = 10 }: { page?: number; size?: number }) => {
    const response = await getAllNotifications({ pageNumber: page, pageSize: size });
    return response.data as PageResponse<Notification[]>;
  }
);

export const CreateNotificationAction = createAsyncThunk(
  "notification/createNotification",
  async (data: Omit<Notification, "id" | "createdAt">) => {
    const response = await createNotification(data);
    return response.data as Notification;
  }
);

export const MarkAsReadAction = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: number) => {
    await readNotificationByIdAndAccountId(notificationId);
    return notificationId;
  }
);

export const MarkAllAsReadAction = createAsyncThunk(
  "notification/markAllAsRead",
  async (ids: number[]) => {
    await readAllNotificationsByIdsAndAccountId(ids);
    return null;
  }
);

export const DeleteNotificationAction = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId: number) => {
    await deleteNotification(notificationId);
    return notificationId;
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotificationLocal: (state, action) => {
      console.log("Adding notification locally:", action.payload);
      if (!state.notifications) {
        state.notifications = {
          data: [],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
        };
      }
      if(state.notifications.data.length >= 10){
        state.notifications.data.pop();
      }
      if(state.unreadCount >= 10){
        state.unreadCount -=1;
      }
      state.notifications.data.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(FetchNotificationsAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchNotificationsAction.fulfilled, (state, action) => {
        state.loading = false;
        const pageResponse = action.payload as PageResponse<Notification[]>;
        state.notifications = pageResponse;
        state.totalCount = pageResponse.totalElements;
        state.unreadCount = pageResponse.data.filter((n) => !n.isRead).length;
        state.pagination = {
          currentPage: pageResponse.pageNumber,
          pageSize: pageResponse.pageSize,
          totalPages: pageResponse.totalPages,
        };
      })
      .addCase(FetchNotificationsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      });

    // Create notification
    builder
      .addCase(CreateNotificationAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateNotificationAction.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.notifications) {
          state.notifications = {
            data: [],
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
          };
        }
        state.notifications.data.unshift(action.payload);
        state.totalCount += 1;
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      })
      .addCase(CreateNotificationAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Create notification failed";
      });

    // Mark as read
    builder
      .addCase(MarkAsReadAction.fulfilled, (state, action) => {
        if (!state.notifications) return;
        const notification = state.notifications.data.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all as read
    builder
      .addCase(MarkAllAsReadAction.fulfilled, (state) => {
        if (!state.notifications) return;
        state.notifications.data.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(DeleteNotificationAction.fulfilled, (state, action) => {
        if (!state.notifications) return;

        const index = state.notifications.data.findIndex((n) => n.id === action.payload);
        if (index > -1) {
          const notification = state.notifications.data[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.data.splice(index, 1);
          state.totalCount = Math.max(0, state.totalCount - 1);
        }
      });
  },
});

export const { addNotificationLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
