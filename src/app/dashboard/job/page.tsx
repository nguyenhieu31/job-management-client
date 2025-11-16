"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDown } from "lucide-react";
import { JobForm } from "@/components/jobs/job-form";
import { JobTable } from "@/components/jobs/job-table";
import { FilterBar } from "@/components/jobs/filter-bar";
import { Pagination } from "@/components/jobs/pagination";
import type {
  UserRole,
  JobAction,
  JobStatus,
  Pagination as PaginationType,
  JobResponse,
} from "@/types/jobs";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import Loader from "@/components/ui/loader";
import { CreateJobAction, GetAllJobsAction, GetAllJobsByAssigneeAction, GetAllJobsByQualifiedAssigneeAction, GetJobFromDropboxAction, GetRandomJobAction, updateJob, UpdateJobAction, UpdateJobStatusAction } from "@/store/slice/jobs/Jobs";
import { PageResponse } from "@/components/types/Page";
import { GetAllEmployeesAction } from "@/store/slice/employee/Employee";
import { EmployeeResponse } from "@/types/employees";
import { GetAllWorkRequestsAction } from "@/store/slice/work-request/WorkRequest";
import { GetAllCustomersAction } from "@/store/slice/customer/Customer";
import { CustomerResponse } from "@/types/customers";
import type { JobRequest } from "@/types/jobs";

export default function JobsPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobResponse | null>(null);
  const lastFetchRef = useRef<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Get user role from Redux store
  const { roleName, email  } = useAppSelector((state) => state.authenticate);
  const {jobs, loading} : {jobs: PageResponse<JobResponse[]> | undefined, loading: boolean} = useAppSelector((state) => state.job);
  const {employees} : {employees: PageResponse<EmployeeResponse[]> | undefined} = useAppSelector((state) => state.employee);
  const {workRequests} = useAppSelector((state) => state.workRequest);
  const {customers} : {customers: PageResponse<CustomerResponse[]> | undefined} = useAppSelector((state) => state.customer);

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

  const handleAddJob = useCallback(async (jobData: JobRequest) => {
    try {
      await dispatch(CreateJobAction(jobData));
      setFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo công việc");
      setFormOpen(true);
    }
  }, [dispatch]);

  const handleUpdateJob = useCallback(async (jobData: JobRequest) => {
    try {
      
      await dispatch(UpdateJobAction(jobData));
      setFormOpen(false);
      setEditingJob(null);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật công việc");
      setFormOpen(true);
    }
  }, [dispatch]);

  const handleJobAction = async (jobId: number, action: JobAction, qaNote?: string) => {
    const job = jobs? jobs.data.find((j) => j.id === jobId) : undefined;
    if (!job) return;

    let newStatus: JobStatus = job.jobStatus;

    switch (action) {
      case "take-job":
        // Employee takes job: pending -> in-progress
        if (job.jobStatus === "PENDING") {
          newStatus = "IN_PROGRESS";
        }
        break;

      case "done-job":
        // Employee completes job: in-progress -> done
        if (job.jobStatus === "IN_PROGRESS") {
          newStatus = "DONE";
        }
        break;

      case "take-review":
        // QA takes job for review: done -> in-review
        if (job.jobStatus === "DONE") {
          newStatus = "IN_REVIEW";
        }
        break;

      case "submit-review":
        // QA submits review: in-review -> reviewed
        if (job.jobStatus === "IN_REVIEW") {
          if(job.qaOutputNumber === null){
            toast.error("Vui lòng nhập số liệu đầu ra QA trước khi gửi duyệt.");
            return;
          }
          newStatus = "REVIEWED";
        }
        break;

      case "rejected":
        // QA rejects job: in-review -> in-progress with qaNote
        if (job.jobStatus === "IN_REVIEW") {
          newStatus = "IN_PROGRESS";
          // Update job with qaNote
          const updatedJob = { ...job, jobStatus: newStatus, qaNote: qaNote || "" };
          await Promise.all([
            dispatch(UpdateJobStatusAction({id: jobId, status: "REJECTED", qaNote: qaNote})),
            dispatch(updateJob(updatedJob))
          ]);
          return;
        }
        break;

      case "complete-job":
        // Manager completes job: reviewed -> completed
        if (job.jobStatus === "REVIEWED") {
          newStatus = "COMPLETED";
        }
        break;

      default:
        return;
    }

    // Update job status
    await Promise.all([
      dispatch(UpdateJobStatusAction({id: jobId, status: newStatus})),
      dispatch(updateJob({...job, jobStatus: newStatus}))
    ]);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const handleClickGetJob = async () => {
    console.log("Get Random Job clicked");
    if(roleName === undefined) return;
    if(roleName === "MANAGER"){
      console.log("Manager role - refreshing job list");
      await dispatch(GetJobFromDropboxAction());
      return;
    }
    dispatch(GetRandomJobAction());
  }

  // Memoize filtered employee lists to avoid recreating on every render
  const employeeList = useMemo(() => 
    employees?.data.filter((e) => e.role.name.toLowerCase() === "employee" || e.role.name.toLowerCase() === "special") || [], 
    [employees]
  );

  const qaList = useMemo(() => 
    employees?.data.filter((e) => e.role.name.toLowerCase() === "qa") || [], 
    [employees]
  );

  const customerList = useMemo(() => 
    customers?.data || [], 
    [customers]
  );

  const workRequestList = useMemo(() => 
    workRequests?.data || [], 
    [workRequests]
  );

  // Fetch jobs when pagination changes - this handles navigation back to page
  useEffect(()=>{
    if(roleName === undefined) return;
    
    // Create a unique key for this fetch request
    const fetchKey = `${roleName}-${pagination.currentPage}-${pagination.pageSize}`;
    
    // Skip if we just fetched with same parameters
    if (lastFetchRef.current === fetchKey) {
      return;
    }
    
    lastFetchRef.current = fetchKey;
    
    if(roleName === "MANAGER"){
      dispatch(GetAllJobsAction({pageNumber: pagination.currentPage - 1, pageSize: pagination.pageSize,}));
    }else if(roleName === "QA"){
      dispatch(GetAllJobsByQualifiedAssigneeAction({pageNumber: pagination.currentPage - 1, pageSize: pagination.pageSize, email: email || ""}));
    }else if(roleName === "EMPLOYEE" || roleName === "SPECIAL"){
      dispatch(GetAllJobsByAssigneeAction({pageNumber: pagination.currentPage - 1, pageSize: pagination.pageSize, email: email || ""}));
    }
  }, [pagination.currentPage, pagination.pageSize, roleName, email, dispatch]);

  // Load related data (employees, work requests, customers) only for Manager on mount
  useEffect(() => {
    if(roleName === undefined) return;
    if(roleName === "MANAGER"){
      Promise.all([
        dispatch(GetAllEmployeesAction({pageNumber: 0, pageSize: 100})),
        dispatch(GetAllWorkRequestsAction({pageNumber: 0, pageSize: 100})),
        dispatch(GetAllCustomersAction({pageNumber: 0, pageSize: 100}))
      ]);
    }
  },[dispatch, roleName]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản Lý Công Việc</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tất cả công việc ở một nơi
          </p>
        </div>

        <div>
          {userRole === "manager" && (
            <Button
              onClick={() => setFormOpen(true)}
              className="sm:w-auto mr-2 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Công Việc
            </Button>
          )}
          {userRole === 'manager' && (
            <Button
              onClick={handleClickGetJob}
              className="sm:w-auto bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Lấy Công Việc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        pagination={pagination}
        onPageChange={handlePageChange}
        employees={employeeList}
        customers={customerList}
      />

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader width={50} height={50} />
        </div>
      ) : (
        <>
          <JobTable
            jobs={jobs ? jobs.data : []}
            userRole={userRole}
            employees={employeeList}
            qaList={qaList}
            customers={customerList}
            onEdit={(job) => {
              setEditingJob(job as unknown as JobResponse);
              setFormOpen(true);
            }}
            onJobAction={handleJobAction}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            totalElements={jobs?.totalElements || 0}
            totalPages={jobs?.totalPages || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Form Dialog */}
      <JobForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={(jobData) => {
          if (editingJob) {
            handleUpdateJob(jobData);
          } else {
            handleAddJob(jobData);
          }
        }}
        editingJob={editingJob}
        customers={customerList}
        employees={employeeList}
        qaList={qaList}
        workRequests={workRequestList}
      />
    </div>
  );
}
