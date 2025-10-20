import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { FetchNotificationsAction } from "@/store/slice/notification/Notification";

export const useNotifications = (intervalMs: number = 30000) => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((state) => state.notification);

  // Initial fetch
  useEffect(() => {
    dispatch(FetchNotificationsAction({ page: 0, size: 10 }));
  }, [dispatch]);

  // Set up polling interval
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(FetchNotificationsAction({ page: 0, size: 10 }));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [dispatch, intervalMs]);

  return {
    notifications: notification.notifications,
    unreadCount: notification.unreadCount,
    loading: notification.loading,
    totalCount: notification.totalCount,
    error: notification.error,
  };
};
