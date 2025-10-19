import { Bell } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/store";

export default function NotificationBell() {
  const { unreadCount } = useAppSelector((state) => state.notification);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative p-2 hover:bg-accent rounded-lg transition-colors"
      title="Thông báo"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </Link>
  );
}
