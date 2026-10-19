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
  VideoTransitionEvent,
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
  GetAllVideosByQualifiedAssigneeAction,
  SearchVideoByConditionsAction,
  UpdateVideoFullAction,
  GetVideoFromDropboxAction,
  GetRandomVideoAction,
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
  const { videos, loading, transitioning, error }: {
    videos: PageResponse<VideoResponse[]> | undefined;
    loading: boolean;
    transitioning: boolean;
    error: string | null;
  } = useAppSelector((state) => state.video);
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
        ).unwrap();
        setFormOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi tạo video");
        setFormOpen(true);
        throw error;
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
        ).unwrap();
        setFormOpen(false);
        setEditingJob(null);
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi cập nhật video");
        setFormOpen(true);
        throw error;
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
    if (!video || transitioning) return false;

    const eventMap: Partial<Record<VideoAction, VideoTransitionEvent>> = {
      "take-video": "TAKE",
      "done-video": "DONE",
      "start-review": "START_REVIEW",
      "approve-review": "APPROVE_REVIEW",
      "reject-review": "REJECT_REVIEW",
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
    if (!event) return false;

    if (action === "reject-video" || action === "reject-review") {
      const reason = payload?.reason?.replace(/<[^>]*>/g, "").trim() || "";
      if (reason.length < 5) {
        toast.error("Lý do từ chối tối thiểu 5 ký tự");
        return false;
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

      toast.success("Cập nhật trạng thái thành công");
      await fetchVideos().catch(() => {
        toast.error("Trạng thái đã cập nhật nhưng chưa tải lại được danh sách. Vui lòng thử lại.");
      });
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái");
      return false;
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const handleClickGetVideo = async () => {
    if (loading || transitioning) return;
    if (userRole === "qa") {
      try {
        await dispatch(GetRandomVideoAction()).unwrap();
      } catch (err: any) {
        toast.error(err?.message || "Không thể tìm việc kiểm duyệt");
      }
    } else if (userRole === "manager") {
      await dispatch(GetVideoFromDropboxAction());
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
      employees?.data.filter(
        (e) => e.role.name.toLowerCase() === "qa" && e.isVideoAccount === true,
      ) || [],
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
  const fetchVideos = useCallback(async () => {
    if (!roleName) return;

    if (activeFilters) {
      await dispatch(SearchVideoByConditionsAction({
        ...activeFilters,
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      })).unwrap();
      return;
    }

    if (userRole === "manager" || userRole === "saler") {
      await dispatch(
        GetAllVideosAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          fromDate: getFirstDayOfMonth(),
        }),
      ).unwrap();
    } 
    // else if (roleName === "SALER") {
    //   dispatch(
    //     GetAllVideosBySalerAssigneeAction({
    //       pageNumber: pagination.currentPage - 1,
    //       pageSize: pagination.pageSize,
    //       fromDate: getFirstDayOfMonth(),
    //     }),
    //   );
    // } 
    else if (userRole === "qa") {
      await dispatch(
        GetAllVideosByQualifiedAssigneeAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          email: email || "",
          fromDate: getFirstDayOfMonth(),
        }),
      ).unwrap();
    } else if (userRole === "employee" || userRole === "special") {
      await dispatch(
        GetAllVideosByAssigneeAction({
          pageNumber: pagination.currentPage - 1,
          pageSize: pagination.pageSize,
          email: email || "",
          fromDate: getFirstDayOfMonth(),
        }),
      ).unwrap();
    }
  }, [pagination.currentPage, pagination.pageSize, roleName, userRole, email, dispatch, activeFilters]);

  useEffect(() => {
    void fetchVideos().catch(() => {});
  }, [fetchVideos]);

  // Load related data (employees, work requests, customers) only for Manager on mount
  useEffect(() => {
    if (roleName === undefined) return;
    if (userRole === "manager" || userRole === "saler") {
      Promise.all([
        dispatch(GetAllEmployeesAction({ pageNumber: 0, pageSize: 1000 })),
        dispatch(GetAllWorkRequestsAction({ pageNumber: 0, pageSize: 1000 })),
        dispatch(GetAllCustomersAction({ pageNumber: 0, pageSize: 1000 })),
      ]);
    }
  }, [dispatch, roleName, userRole]);

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
          {(userRole === "manager" || userRole === "qa") && (
            <Button
              onClick={handleClickGetVideo}
              disabled={loading || transitioning}
              className="sm:w-auto bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              {userRole === "qa" ? "Tìm việc kiểm duyệt" : "Lấy Video Ngẫu Nhiên"}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <VideoFilterBar
        pagination={pagination}
        onPageChange={handlePageChange}
        employees={employeeList.filter((e) => e.isVideoAccount === true)}
        customers={customerList.filter((c) => c.isVideoAccount === true)}
        salers={salerList}
        onFiltersChange={setActiveFilters}
      />

      {/* Table */}
      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 p-4 text-destructive">
          <span>{error}</span>
          <Button variant="outline" onClick={() => void fetchVideos().catch(() => {})}>Thử lại</Button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
        <VideoTable
          videos={videos ? videos.data : []}
          userRole={userRole}
          qaList={qaList}
          actionPending={transitioning}
          employees={employeeList.filter((e) => e.isVideoAccount === true)}
          customers={customerList.filter((c) => c.isVideoAccount === true)}
          onVideoAction={handleVideoAction}
          onEdit={(video) => {
            setEditingJob(video);
            setFormOpen(true);
          }}
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
            return handleUpdateJob(
              jobData,
              images,
              videos,
              imageTempUrls,
              videoTempUrls,
            );
          } else {
            return handleAddVideo(
              jobData,
              images,
              videos,
              imageTempUrls,
              videoTempUrls,
            );
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
