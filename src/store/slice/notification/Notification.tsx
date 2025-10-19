import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Notification } from "@/types/notifications";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/services/NotificationApi";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  totalCount: 0,
};

export const FetchNotificationsAction = createAsyncThunk(
  "notification/fetchNotifications",
  async ({ page = 0, size = 10 }: { page?: number; size?: number }) => {
    return await getNotifications(page, size);
  }
);

export const MarkAsReadAction = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: number) => {
    await markAsRead(notificationId);
    return notificationId;
  }
);

export const MarkAllAsReadAction = createAsyncThunk(
  "notification/markAllAsRead",
  async () => {
    await markAllAsRead();
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
      state.notifications.unshift(action.payload);
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
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
        state.totalCount = action.payload.count;
      })
      .addCase(FetchNotificationsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      });

    // Mark as read
    builder
      .addCase(MarkAsReadAction.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all as read
    builder
      .addCase(MarkAllAsReadAction.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });

    // Delete notification
    builder
      .addCase(DeleteNotificationAction.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n.id === action.payload);
        if (index > -1) {
          const notification = state.notifications[index];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(index, 1);
          state.totalCount = Math.max(0, state.totalCount - 1);
        }
      });
  },
});

export const { addNotificationLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
