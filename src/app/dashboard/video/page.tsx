"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDown } from "lucide-react";
import { VideoForm } from "@/components/videos/video-form";
import { VideoTable } from "@/components/videos/video-table";
import { VideoFilterBar } from "@/components/videos/video-filter-bar";
import { Pagination } from "@/components/videos/pagination";
import type {
  UserRole,
  VideoAction,
  VideoStatus,
  Pagination as PaginationType,
  VideoResponse,
} from "@/types/videos";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import Loader from "@/components/ui/loader";
import {
  CreateVideoAction,
  GetAllVideosAction,
  GetAllVideosByAssigneeAction,
  GetVideoFromDropboxAction,
  updateVideo,
  UpdateVideoFullAction,
  UpdateVideoStatusAction,
} from "@/store/slice/videos/Videos";
import { PageResponse } from "@/components/types/Page";
import { GetAllEmployeesAction } from "@/store/slice/employee/Employee";
import { EmployeeResponse } from "@/types/employees";
import { GetAllWorkRequestsAction } from "@/store/slice/work-request/WorkRequest";
import { GetAllCustomersAction } from "@/store/slice/customer/Customer";
import { CustomerResponse } from "@/types/customers";
import type { VideoRequest } from "@/types/videos";
import { getFirstDayOfMonth } from "@/lib/utils";

export default function VideosPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingJob] = useState<VideoResponse | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Get user role from Redux store
  const { roleName, email } = useAppSelector((state) => state.authenticate);
  const {
    videos,
    loading,
  }: { videos: PageResponse<VideoResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.video);
  const {
    employees,
  }: { employees: PageResponse<EmployeeResponse[]> | undefined } =
    useAppSelector((state) => state.employee);
  const { workRequests } = useAppSelector((state) => state.workRequest);
  const {
    customers,
  }: { customers: PageResponse<CustomerResponse[]> | undefined } =
    useAppSelector((state) => state.customer);

  // Map role from backend to our UserRole type
  const getUserRole = (): UserRole => {
    const role = roleName?.toLowerCase();
    if (role === "manager" || role === "admin") return "manager";
    if (role === "qa") return "qa";
    if (role === "special") return "special";
    return "employee";
  };

  const userRole = getUserRole();

  // Handle pagination actions
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
      currentPage: 1,
    }));
  };

  const handleAddVideo = useCallback(
    async (jobData: VideoRequest) => {
      try {
        await dispatch(CreateVideoAction(jobData));
        setFormOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi tạo video");
        setFormOpen(true);
      }
    },
    [dispatch]
  );

  const handleUpdateJob = useCallback(
    async (jobData: VideoRequest) => {
      try {
        await dispatch(UpdateVideoFullAction(jobData));
        setFormOpen(false);
        setEditingJob(null);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi cập nhật video");
        setFormOpen(true);
      }
    },
    [dispatch]
  );

  const handleVideoAction = async (videoId: number, action: VideoAction) => {
    const video = videos
      ? videos.data.find((v) => v.id === videoId)
      : undefined;
    if (!video) return;

    let newStatus: VideoStatus = video.jobStatus;

    switch (action) {
      case "take-video":
        // Employee takes video: pending -> in-progress
        if (video.jobStatus === "PENDING") {
          newStatus = "IN_PROGRESS";
        }
        break;

      case "done-video":
        // Employee completes video: in-progress -> done
        if (video.jobStatus === "IN_PROGRESS") {
          newStatus = "DONE";
        }
        break;

      case "complete-video":
        // Manager completes video: done -> completed
        if (video.jobStatus === "DONE") {
          newStatus = "COMPLETED";
        }
        break;

      default:
        return;
    }

    // Update video status
    const updatedVideo = { ...video, jobStatus: newStatus };
    await Promise.all([
      dispatch(UpdateVideoStatusAction({ id: videoId, status: newStatus })),
      dispatch(updateVideo(updatedVideo)),
    ]);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const handleClickGetVideo = async () => {
    console.log("Get Random Video clicked");
    if (roleName === undefined) return;
    if (roleName === "MANAGER") {
      console.log("Manager role - refreshing video list");
      await dispatch(GetVideoFromDropboxAction());
      return;
    }
  };

  // Memoize filtered employee lists to avoid recreating on every render
  const employeeList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "employee" || e.role.name.toLowerCase() === "special") ||
      [],
    [employees]
  );

  const qaList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "qa") || [],
    [employees]
  );

  const customerList = useMemo(() => customers?.data || [], [customers]);

  const workRequestList = useMemo(
    () => workRequests?.data || [],
    [workRequests]
  );

  // Fetch videos when pagination changes - this handles navigation back to page
  useEffect(() => {
    if (roleName === undefined) return;

    const fetchVideos = () => {
      if (roleName === "MANAGER") {
        dispatch(
          GetAllVideosAction({
            pageNumber: pagination.currentPage - 1,
            pageSize: pagination.pageSize,
            fromDate: getFirstDayOfMonth(),
          })
        );
      } else if (roleName === "QA") {
        dispatch(
          GetAllVideosByAssigneeAction({
            pageNumber: pagination.currentPage - 1,
            pageSize: pagination.pageSize,
            email: email || "",
            fromDate: getFirstDayOfMonth(),
          })
        );
      } else if (roleName === "EMPLOYEE" || roleName === "SPECIAL") {
        dispatch(
          GetAllVideosByAssigneeAction({
            pageNumber: pagination.currentPage - 1,
            pageSize: pagination.pageSize,
            email: email || "",
            fromDate: getFirstDayOfMonth(),
          })
        );
      }
    };

    // Initial fetch
    fetchVideos();

    // Set up interval to fetch every 5 minutes
    // const intervalId = setInterval(() => {
    //   fetchVideos();
    // }, 300000);

    // // Cleanup interval on unmount or when dependencies change
    // return () => clearInterval(intervalId);
  }, [pagination.currentPage, pagination.pageSize, roleName, email, dispatch]);

  // Load related data (employees, work requests, customers) only for Manager on mount
  useEffect(() => {
    if (roleName === undefined) return;
    if (roleName === "MANAGER") {
      Promise.all([
        dispatch(GetAllEmployeesAction({ pageNumber: 0, pageSize: 1000 })),
        dispatch(GetAllWorkRequestsAction({ pageNumber: 0, pageSize: 1000 })),
        dispatch(GetAllCustomersAction({ pageNumber: 0, pageSize: 1000 })),
      ]);
    }
  }, [dispatch, roleName]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản Lý Công Việc
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tất cả video ở một nơi
          </p>
        </div>

        <div>
          {userRole === "manager" && (
            <>
              <Button
                onClick={() => setFormOpen(true)}
                className="sm:w-auto mr-2 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm Công Việc
              </Button>
              <Button
                onClick={handleClickGetVideo}
                className="sm:w-auto bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Lấy Video Ngẫu Nhiên
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <VideoFilterBar
        pagination={pagination}
        onPageChange={handlePageChange}
        employees={employeeList.filter((e) => e.isVideoAccount === true)}
        customers={customerList.filter((c) => c.isVideoAccount === true)}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <VideoTable
            videos={videos ? videos.data : []}
            userRole={userRole}
            employees={employeeList.filter((e) => e.isVideoAccount === true)}
            customers={customerList.filter((c) => c.isVideoAccount === true)}
            onVideoAction={handleVideoAction}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={videos?.totalElements || 0}
            totalPages={videos?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form Dialog */}
      <VideoForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={(jobData) => {
          if (editingVideo) {
            handleUpdateJob(jobData);
          } else {
            handleAddVideo(jobData);
          }
        }}
        editingVideo={editingVideo}
        customers={customerList.filter((c) => c.isVideoAccount === true)}
        employees={employeeList.filter((e) => e.isVideoAccount === true)}
        qaList={qaList}
        workRequests={workRequestList}
      />
    </div>
  );
}
