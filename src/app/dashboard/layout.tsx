"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { useNotifications } from "@/hooks/use-notifications";
import { CheckSessionLoginAction } from "@/store/slice/authentication/Authentication";
import { useAppDispatch } from "@/store/store";
import { useEffect, useRef } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch();
  const hasChecked = useRef(false);
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      dispatch(CheckSessionLoginAction());
    }
  }, [dispatch]);
  useNotifications(300000);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}