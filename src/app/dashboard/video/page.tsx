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
  GetAllVideosBySalerAssigneeAction,
  SearchVideoByConditionsAction,
  updateVideo,
  UpdateVideoFullAction,
  UpdateVideoStatusAction,
  GetVideoFromDropboxAction,
  TransitionVideoAction,
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

  // Active filters state for pagination
  const [activeFilters, setActiveFilters] = useState<any>(null);

  // Get user role from Redux store
  const { roleName, email, id } = useAppSelector((state) => state.authenticate);
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
    if (role === "saler") return "saler";
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
    async (
      jobData: VideoRequest,
      images?: File[],
      videos?: File[],
      imageTempUrls?: string[],
      videoTempUrls?: string[],
    ) => {
      try {
        await dispatch(
          CreateVideoAction({
            data: jobData,
            images,
            videos,
            imageTempUrls,
            videoTempUrls,
          }),
        );
        setFormOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi tạo video");
        setFormOpen(true);
      }
    },
    [dispatch],
  );

  const handleUpdateJob = useCallback(
    async (
      jobData: VideoRequest,
      images?: File[],
      videos?: File[],
      imageTempUrls?: string[],
      videoTempUrls?: string[],
    ) => {
      try {
        await dispatch(
          UpdateVideoFullAction({
            data: jobData,
            images,
            videos,
            imageTempUrls,
            videoTempUrls,
          }),
        );
        setFormOpen(false);
        setEditingJob(null);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi cập nhật video");
        setFormOpen(true);
      }
    },
    [dispatch],
  );

  const handleVideoAction = async (
    videoId: number,
    action: VideoAction,
    payload?: { reason?: string; linkDone?: string },
  ) => {
    const video = videos
      ? videos.data.find((v) => v.id === videoId)
      : undefined;
    if (!video) return;

    const eventMap: Partial<Record<VideoAction, string>> = {
      "take-video": "TAKE",
      "done-video": "DONE",
      "complete-video": "APPROVE",
      "reject-video": "REJECT",
      "mark-delivered": "MARK_DELIVERED",
      "request-revision": "REQUEST_REVISION",
      "start-revision": "START_REVISION",
      "finish-revision": "FINISH_REVISION",
      "re-request-revision": "RE_REQUEST_REVISION",
      "accept-revision": "ACCEPT_REVISION",
    };

    const event = eventMap[action];
    if (!event) return;

    if (action === "reject-video") {
      const reason = payload?.reason?.trim() || "";
      if (reason.length < 5) {
        toast.error("Lý do từ chối tối thiểu 5 ký tự");
        return;
      }
    }

    try {
      await dispatch(
        TransitionVideoAction({
          id: videoId,
          event,
          reason: payload?.reason,
          linkDone: payload?.linkDone,
        }),
      ).unwrap();

      // Optimistic local patch for common fields
      let patch: Partial<typeof video> = {};
      switch (action) {
        case "take-video":
          patch = { jobStatus: "IN_PROGRESS" };
          break;
        case "done-video":
          patch = { jobStatus: "DONE" };
          break;
        case "complete-video":
          patch = {
            jobStatus: "COMPLETED",
            deliveryStatus: "NOT_DELIVERED",
            revisionStatus: "NONE",
          };
          break;
        case "reject-video":
          patch = {
            jobStatus: "IN_PROGRESS",
            rejectReason: payload?.reason,
            deliveryStatus: "NONE",
          };
          break;
        case "mark-delivered":
          patch = { deliveryStatus: "DELIVERED" };
          break;
        case "request-revision":
        case "re-request-revision":
          patch = { revisionStatus: "REVISION_REQUESTED" };
          break;
        case "start-revision":
          patch = { revisionStatus: "REVISION_IN_PROGRESS" };
          break;
        case "finish-revision":
          patch = { revisionStatus: "REVISION_DONE" };
          break;
        case "accept-revision":
          patch = {
            revisionStatus: "NONE",
            deliveryStatus: "DELIVERED",
            rejectReason: null,
          };
          break;
      }
      dispatch(updateVideo({ ...video, ...patch }));
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái");
    }
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
      employees?.data.filter(
        (e) =>
          e.role.name.toLowerCase() === "employee" ||
          e.role.name.toLowerCase() === "special",
      ) || [],
    [employees],
  );

  const salerList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "saler") || [],
    [employees],
  );

  const qaList = useMemo(
    () =>
      employees?.data.filter((e) => e.role.name.toLowerCase() === "qa") || [],
    [employees],
  );

  const customerList = useMemo(() => customers?.data || [], [customers]);

  const filteredCustomerList = useMemo(() =>
    roleName === "SALER" && id != null
      ? customerList.filter((c) => c.sales?.some((s) => s.id === id))
      : customerList,
    [customerList, roleName, id]
  );

  const workRequestList = useMemo(
    () => workRequests?.data || [],
    [workRequests],
  );

  // Fetch videos when pagination or filters change
  useEffect(() => {
    if (roleName === undefined) return;

    if (activeFilters) {
      dispatch(SearchVideoByConditionsAction({
        ...activeFilters,
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      }));
      return;
    }

    if (roleName === "MANAGER") {
      dispatch(
        GetAllVideosAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          fromDate: getFirstDayOfMonth(),
        }),
      );
    } else if (roleName === "SALER") {
      dispatch(
        GetAllVideosBySalerAssigneeAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          fromDate: getFirstDayOfMonth(),
        }),
      );
    } else if (roleName === "QA") {
      dispatch(
        GetAllVideosByAssigneeAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          email: email || "",
          fromDate: getFirstDayOfMonth(),
        }),
      );
    } else if (roleName === "EMPLOYEE" || roleName === "SPECIAL") {
      dispatch(
        GetAllVideosByAssigneeAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          email: email || "",
          fromDate: getFirstDayOfMonth(),
        }),
      );
    }
  }, [pagination.currentPage, pagination.pageSize, roleName, email, dispatch, activeFilters]);

  // Load related data (employees, work requests, customers) only for Manager on mount
  useEffect(() => {
    if (roleName === undefined) return;
    if (roleName === "MANAGER" || roleName === "SALER") {
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
          {(userRole === "manager" || userRole === "saler") && (
            <Button
              onClick={() => setFormOpen(true)}
              className="sm:w-auto mr-2 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Công Việc
            </Button>
          )}
          {userRole === "manager" && (
            <Button
              onClick={handleClickGetVideo}
              className="sm:w-auto bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Lấy Video Ngẫu Nhiên
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <VideoFilterBar
        pagination={pagination}
        onPageChange={handlePageChange}
        employees={employeeList.filter((e) => e.isVideoAccount === true)}
        customers={filteredCustomerList.filter((c) => c.isVideoAccount === true)}
        salers={salerList}
        onFiltersChange={setActiveFilters}
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
          customers={filteredCustomerList.filter((c) => c.isVideoAccount === true)}
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
        onSubmit={(jobData, images, videos, imageTempUrls, videoTempUrls) => {
          if (editingVideo) {
            handleUpdateJob(
              jobData,
              images,
              videos,
              imageTempUrls,
              videoTempUrls,
            );
          } else {
            handleAddVideo(
              jobData,
              images,
              videos,
              imageTempUrls,
              videoTempUrls,
            );
          }
        }}
        editingVideo={editingVideo}
        customers={filteredCustomerList.filter((c) => c.isVideoAccount === true)}
        employees={employeeList.filter((e) => e.isVideoAccount === true)}
        qaList={qaList}
        workRequests={workRequestList}
      />
    </div>
  );
}
