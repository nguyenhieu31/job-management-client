/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkRequestForm } from "@/components/work-requests/work-request-form";
import { WorkRequestTable } from "@/components/work-requests/work-request-table";
import { WorkRequestFilterBar } from "@/components/work-requests/work-request-filter-bar";
import { Pagination } from "@/components/jobs/pagination";
import type {
  WorkRequestResponse,
  WorkRequestFilters,
  WorkRequestPagination,
  WorkRequestRequest,
} from "@/types/work-requests";
import { useAppDispatch, useAppSelector } from "@/store/store";
import Loader from "@/components/ui/loader";
import { CreateWorkRequestAction, DeleteWorkRequestAction, GetAllWorkRequestsAction, SearchWorkRequestsAction, UpdateWorkRequestAction } from "@/store/slice/work-request/WorkRequest";
import { PageResponse } from "@/components/types/Page";
import { toast } from "react-toastify";

export default function WorkRequestsPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkRequest, setEditingWorkRequest] =
    useState<WorkRequestResponse | null>(null);

  // Filters state
  const [filters, setFilters] = useState<WorkRequestFilters>({
    search: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<WorkRequestPagination>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Get data from Redux store
  const { roleName } = useAppSelector((state) => state.authenticate);
  const {
    workRequests,
    loading,
  }: { workRequests: PageResponse<WorkRequestResponse[]> | undefined; loading: boolean } =
    useAppSelector((state) => state.workRequest);

  // Filter work requests
  const filteredWorkRequests = useMemo(() => {
    if (!workRequests) return [];

    return workRequests.data;
  }, [workRequests]);

  // Handle filter actions
  const handleApplyFilters = async () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    const payload = {
      pageNumber: 0,
      pageSize: pagination.pageSize,
      keyword: filters.search,
    }
    await dispatch(SearchWorkRequestsAction(payload));
  };

  const handleResetFilters = () => {
    const resetFilters: WorkRequestFilters = {
      search: "",
    };
    setFilters(resetFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchWorkRequests();
  };

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

  const handleAddWorkRequest = async (workRequest: Partial<WorkRequestRequest>) => {
    if (workRequest.id) {
      const payload = {
        id: workRequest.id,
        categoryName: workRequest.categoryName || "",
        summaryNote: workRequest.summaryNote || "",
        detailedNotes: workRequest.detailedNotes || "",
        linkSample: workRequest.linkSample || "",
        fileType: workRequest.fileType || "",
        colorNote: workRequest.colorNote || ""
      }
      await dispatch(UpdateWorkRequestAction(payload as WorkRequestRequest));
      setEditingWorkRequest(null);
    } else {
      const payload = {
        categoryName: workRequest.categoryName || "",
        summaryNote: workRequest.summaryNote || "",
        detailedNotes: workRequest.detailedNotes || "",
        linkSample: workRequest.linkSample || "",
        fileType: workRequest.fileType || "",
        colorNote: workRequest.colorNote || ""
      }
      await dispatch(CreateWorkRequestAction(payload as WorkRequestRequest));
    }
  };

  const handleEditWorkRequest = (workRequest: WorkRequestResponse) => {
    setEditingWorkRequest(workRequest);
    setFormOpen(true);
  };

  const handleDeleteWorkRequest = async (id: number) => {
    if (!id) return;
    await dispatch(DeleteWorkRequestAction(id));
    // Refresh the work request list
    fetchWorkRequests();
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingWorkRequest(null);
    }
  };

  const fetchWorkRequests = useCallback(() => {
    if (roleName === undefined) return;
    
    dispatch(
      GetAllWorkRequestsAction({
        pageNumber: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      })
    );
  }, [dispatch, pagination.currentPage, pagination.pageSize, roleName]);

  useEffect(() => {
    fetchWorkRequests();
  }, [fetchWorkRequests]);

  // Update pagination totals when work requests data changes
  useEffect(() => {
    if (workRequests) {
      setPagination((prev) => ({
        ...prev,
        totalItems: workRequests.totalElements,
        totalPages: workRequests.totalPages,
      }));
    }
  }, [workRequests]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản Lý Yêu Cầu Công Việc
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các loại yêu cầu, hướng dẫn và liên kết mẫu
          </p>
        </div>

        <div>
          {roleName === "MANAGER" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="sm:w-auto cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Yêu Cầu
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <WorkRequestFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <WorkRequestTable
            workRequests={filteredWorkRequests}
            onEdit={handleEditWorkRequest}
            onDelete={handleDeleteWorkRequest}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={workRequests?.totalElements || 0}
            totalPages={workRequests?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form Dialog */}
      <WorkRequestForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleAddWorkRequest}
        editingWorkRequest={editingWorkRequest}
      />
    </div>
  );
}
