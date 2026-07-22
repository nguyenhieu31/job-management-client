"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchOverviewDashboard } from "@/store/slice/overview/Overview";
import useRouter from "@/hooks/use-router";
import OverviewMetricCards from "@/components/overview/overview-metric-cards";
import JobStatusChart from "@/components/overview/job-status-chart";
import VideoStatusChart from "@/components/overview/video-status-chart";
import RevenueBarChart from "@/components/overview/revenue-bar-chart";
import { ShieldOff, BarChart3 } from "lucide-react";

export default function OverviewPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { roleName } = useAppSelector((state) => state.authenticate);
  const { dashboardData, loading, error } = useAppSelector((s) => s.overview);

  // Role guard: only MANAGER can access this page
  useEffect(() => {
    if (roleName && roleName !== "MANAGER") {
      router.replace("/dashboard/job");
    }
  }, [roleName, router]);

  // Fetch dashboard on mount
  useEffect(() => {
    if (roleName === "MANAGER") {
      dispatch(fetchOverviewDashboard());
    }
  }, [dispatch, roleName]);

  // While role is being checked
  if (!roleName) return null;

  // Block non-managers with an access denied banner
  if (roleName !== "MANAGER") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldOff className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Không có quyền truy cập</h2>
        <p className="text-sm">Trang này chỉ dành cho tài khoản MANAGER.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tổng Quan
          </h1>
          <p className="text-sm text-muted-foreground">
            Thống kê và chỉ số hoạt động kinh doanh
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* R1 — Metric Cards */}
      <section id="overview-metric-cards">
        <OverviewMetricCards data={dashboardData} loading={loading} />
      </section>

      {/* R2 — Job Status Bar Chart */}
      <section id="overview-job-status-chart">
        <JobStatusChart />
      </section>

      {/* R3 — Video Status Bar Chart */}
      <section id="overview-video-status-chart">
        <VideoStatusChart />
      </section>

      {/* R4 — Revenue Bar Chart */}
      <section id="overview-revenue-chart">
        <RevenueBarChart />
      </section>
    </div>
  );
}
