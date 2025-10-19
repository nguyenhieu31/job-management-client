"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye } from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import type {
  UserRole,
  JobAction,
  JobResponse,
  CustomerInfo,
} from "@/types/jobs";
import { ROLE_COLUMNS } from "@/types/jobs";
import { EditableSelect } from "./editable-select";
import { EditableInput } from "./editable-input";
import { ActionCell } from "./action-cell";
import { formatCurrency, formatCurrencyVND, formatDate } from "@/lib/utils";
import { EmployeeResponse } from "@/types/employees";
import { JobDetailDialog } from "./job-detail-dialog";
import SearchableDropdown from "../ui/search-able-dropdown";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  DeleteJobByIdAction,
  GetAllJobsAction,
  UpdateGridViewJobAction,
} from "@/store/slice/jobs/Jobs";
import { toast } from "react-toastify";

interface JobTableProps {
  jobs: JobResponse[];
  userRole: UserRole;
  employees?: EmployeeResponse[];
  qaList?: EmployeeResponse[];
  customers?: CustomerInfo[];
  onEdit: (job: JobResponse) => void;
  onJobAction: (jobId: number, action: JobAction) => void;
}

const jobStatusColors: Record<string, string> = {
  PENDING:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  IN_PROGRESS:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  DONE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  IN_REVIEW:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  REVIEWED:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

const jobStatusLabels: Record<string, string> = {
  PENDING: "Đang chờ",
  IN_PROGRESS: "Đang tiến hành",
  DONE: "Đã hoàn thành",
  IN_REVIEW: "Đang xem xét",
  REVIEWED: "Đã được xem xét",
  COMPLETED: "Đã hoàn tất",
};

const paymentStatusColors = {
  UNPAID: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  PARTIAL:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

const paymentStatusOptions = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PARTIAL", label: "Thanh toán một phần" },
  { value: "PAID", label: "Đã thanh toán" },
];

const columnLabels: Record<string, string> = {
  code: "Mã Công Việc",
  date: "Ngày",
  customerName: "Tên Khách Hàng",
  caseName: "Tên Job",
  workRequest: "Yêu Cầu Công Việc",
  totalPrice: "Tổng Giá",
  linkInput: "Link Nhập",
  linkDone: "Link Hoàn Thành",
  inputCount: "Số Lượng Input",
  outputCount: "Số Lượng Output",
  fileCount: "Số Lượng File",
  filePrice: "Giá File",
  payPerFile: "Trả/File",
  totalPayPerFile: "Tổng Trả",
  jobStatus: "Tình Trạng Công Việc",
  paymentStatus: "Tình Trạng Thanh Toán",
  note: "Ghi Chú",
  assignedEmployee: "Người Được Giao",
  qa: "QA",
  actions: "Hành Động",
};

const filePriceOptions = [
  { id: 1, name: 0.7 },
  { id: 2, name: 0.76 },
  { id: 3, name: 0.6 },
  { id: 4, name: 0.5 },
  { id: 5, name: 1 },
  { id: 6, name: 13 },
  { id: 7, name: 5 },
  { id: 8, name: 4 },
];

export function JobTable({
  jobs,
  userRole,
  employees,
  qaList,
  customers = [],
  onEdit,
  onJobAction,
}: JobTableProps) {
  const dispatch = useAppDispatch();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState<JobResponse | null>(null);
  const { roleName } = useAppSelector((state) => state.authenticate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Track pending changes for Manager role using useRef to avoid re-renders
  const pendingChangesRef = useRef<Record<number, Partial<JobResponse>>>({});
  // Ref to track action cell components
  const actionCellRefs = useRef<Record<number, any>>({});

  // Get visible columns based on role
  const visibleColumns = ROLE_COLUMNS[userRole];

  // Check if user can edit specific fields (only manager can edit all editable fields)
  const canEditField = () => {
    // Employee and QA cannot edit job status via dropdown anymore
    // Only Manager can edit via dropdown
    return userRole === "manager";
  };

  // Handle field change (store in pending changes instead of immediate save)
  const handleFieldChange = useCallback(
    (jobId: number, field: string, value: string | number | any) => {
      if (field === "customer") {
        if (value === null) return;
        const customer = customers.find((c) => c.id === value.id);
        pendingChangesRef.current[jobId] = {
          ...(pendingChangesRef.current[jobId] || {}),
          [field]: customer,
        };
      } else if (field === "filePrice") {
        if (value === null) return;
        pendingChangesRef.current[jobId] = {
          ...(pendingChangesRef.current[jobId] || {}),
          [field]: value.name,
        };
      } else {
        console.log("value", value);
        pendingChangesRef.current[jobId] = {
          ...(pendingChangesRef.current[jobId] || {}),
          [field]: value,
        };
      }
      // Trigger re-render to update UI
      setUpdateTrigger((prev) => prev + 1);
      // Force re-render of action cell
      if (actionCellRefs.current[jobId]) {
        actionCellRefs.current[jobId].forceUpdate?.();
      }
    },
    [customers]
  );

  // Save pending changes
  const handleSaveChanges = useCallback(
    (jobId: number) => {
      const changes = pendingChangesRef.current[jobId];
      if (changes) {
        const assigneeId = changes.assignee?.id;
        const qualifiedAssigneeId = changes.qualifiedAssignee?.id;
        const payload = {
          jobId: jobId,
          assigneeId: assigneeId
            ? Number.parseInt(assigneeId.toString())
            : null,
          customerId: changes.customer?.id || null,
          filePrice: changes.filePrice || null,
          inputNumber: changes.inputNumber || null,
          outputNumber: changes.outputNumber || null,
          qualifiedAssigneeId: qualifiedAssigneeId
            ? Number.parseInt(qualifiedAssigneeId.toString())
            : null,
          paymentStatus: changes.paymentStatus || null,
          doneLink: changes.doneLink || null,
        };

        // Dispatch API call
        dispatch(UpdateGridViewJobAction(payload))
          .then(() => {
            // Clear pending changes AFTER API succeeds
            delete pendingChangesRef.current[jobId];
            // Trigger re-render to show updated values from API
            setUpdateTrigger((prev) => prev + 1);
            // Force re-render action cell
            if (actionCellRefs.current[jobId]) {
              actionCellRefs.current[jobId].forceUpdate?.();
            }
            toast.success("Cập nhật công việc thành công");
          })
          .catch((error) => {
            toast.error("Lỗi khi cập nhật công việc");
            console.error(error);
          });
      }
    },
    [dispatch]
  );

  // Cancel pending changes
  const handleCancelChanges = useCallback((jobId: number) => {
    delete pendingChangesRef.current[jobId];
    // Force re-render action cell
    if (actionCellRefs.current[jobId]) {
      actionCellRefs.current[jobId].forceUpdate?.();
    }
  }, []);

  // Get current value (pending or original)
  const getCurrentValue = useCallback(
    (job: JobResponse, field: keyof JobResponse) => {
      if (
        pendingChangesRef.current[job.id] &&
        field in pendingChangesRef.current[job.id]
      ) {
        return pendingChangesRef.current[job.id][field];
      }
      return job[field];
    },
    []
  );

  const handleDeleteClick = (id: number) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete !== null) {
      await dispatch(DeleteJobByIdAction({ id: jobToDelete }));
      if (roleName === undefined) return;
      if (roleName === "MANAGER") {
        await dispatch(
          GetAllJobsAction({
            pageNumber: 0,
            pageSize: 10,
          })
        );
      }
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handlePreviewClick = (job: JobResponse) => {
    if (
      (userRole === "employee" && job.jobStatus === "PENDING") ||
      (userRole === "qa" && job.jobStatus === "DONE")
    ){
      toast.info("Nhận job này để xem chi tiết");
      return;
    }
    setPreviewJob(job);
    setPreviewDialogOpen(true);
  };

  // Memoize customer options to avoid recreating array on every render
  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, name: c.name })),
    [customers]
  );

  // Create memoized onChange handlers for each job to avoid inline function creation
  const createInputNumberHandler = useCallback(
    (jobId: number) => (value: number) => {
      handleFieldChange(jobId, "inputNumber", value);
    },
    [handleFieldChange]
  );

  const createOutputNumberHandler = useCallback(
    (jobId: number) => (value: number) => {
      handleFieldChange(jobId, "outputNumber", value);
    },
    [handleFieldChange]
  );

  const createCustomerChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      handleFieldChange(jobId, "customer", value);
    },
    [handleFieldChange]
  );

  const createFilePriceChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      handleFieldChange(jobId, "filePrice", value);
    },
    [handleFieldChange]
  );

  const renderCell = (job: JobResponse, column: string) => {
    // console.log("Rendering cell for job", job.id, "column", column);
    switch (column) {
      case "code":
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">#{job.code}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreviewClick(job)}
              className="h-7 w-7 p-0"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );

      case "date":
        return <span>{formatDate(job.createdAt.toString())}</span>;

      case "customerName":
        if (canEditField() && customers.length > 0 && userRole === "manager") {
          return (
            <SearchableDropdown
              options={customerOptions}
              placeholder="Tìm kiếm khách hàng..."
              onChange={createCustomerChangeHandler(job.id)}
              defaultValue={job.customer}
              className="w-55"
              type="text"
            />
          );
        }
        return (
          <span>
            {job.customer && job.customer.name ? job.customer.name : "—"}
          </span>
        );

      case "caseName":
        return <span className="max-w-[200px] truncate">{job.caseName}</span>;

      case "workRequest":
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">
              {job.workRequest?.categoryName || "—"}
            </div>
            {job.workRequest?.fileType && (
              <Badge variant="outline" className="mt-1 text-xs">
                {job.workRequest.fileType}
              </Badge>
            )}
          </div>
        );

      case "totalPrice":
        return (
          <span className="font-medium">{formatCurrency(job.totalPrice)}</span>
        );

      case "linkInput":
        // EMPLOYEE can only see link after taking job (IN_PROGRESS or later)
        if (userRole === "employee" && job.jobStatus === "PENDING") {
          return (
            <div className="flex items-center justify-center text-muted-foreground">
              <Eye className="h-4 w-4" />
            </div>
          );
        }
        return (
          <a
            href={job.inputLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline max-w-[150px] truncate block"
          >
            {job.inputLink || "—"}
          </a>
        );

      case "linkDone":
        // EMPLOYEE can edit Link Done when job is IN_PROGRESS
        if (userRole === "employee" && job.jobStatus === "IN_PROGRESS") {
          const currentDoneLink = getCurrentValue(job, "doneLink") as string;
          return (
            <input
              key={`doneLink-${job.id}`}
              type="text"
              value={currentDoneLink || ""}
              onChange={(e) =>
                handleFieldChange(job.id, "doneLink", e.target.value)
              }
              placeholder="Dán link hoàn thành..."
              className="w-full px-2 py-1 text-sm border rounded-md border-green-200 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          );
        }
        return (
          <a
            href={job.doneLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline max-w-[150px] truncate block"
          >
            {job.doneLink || "—"}
          </a>
        );

      case "inputCount":
        // Manager can edit Input Count, Employee cannot
        if (userRole === "manager") {
          return (
            <EditableInput
              value={getCurrentValue(job, "inputNumber") as number}
              onChange={createInputNumberHandler(job.id)}
              className="border-blue-200 focus:border-blue-400"
            />
          );
        }
        // Employee and QA: read-only
        return <span>{job.inputNumber}</span>;

      case "outputCount":
        // Employee can edit Output Count, Manager and QA cannot
        if (userRole === "employee" && job.jobStatus === "IN_PROGRESS") {
          return (
            <EditableInput
              value={getCurrentValue(job, "outputNumber") as number}
              onChange={createOutputNumberHandler(job.id)}
              className="border-green-200 focus:border-green-400"
            />
          );
        }
        // Manager and QA: read-only
        return <span>{job.outputNumber}</span>;

      case "fileCount":
        return <span>{job.fileCount}</span>;

      case "filePrice":
        if (canEditField() && userRole === "manager") {
          return (
            <SearchableDropdown
              options={filePriceOptions}
              placeholder="Tìm kiếm giá file..."
              onChange={createFilePriceChangeHandler(job.id)}
              defaultValue={{ id: 0, name: job.filePrice }}
              className="w-50"
              type="number"
            />
          );
        }
        return <span>{formatCurrency(job.filePrice)}</span>;

      case "payPerFile":
        return <span>{formatCurrencyVND(job.payPerFile)}</span>;

      case "totalPayPerFile":
        return (
          <span className="font-medium">
            {formatCurrencyVND(job.totalPayPerFile)}
          </span>
        );

      case "jobStatus":
        // All roles (including Manager) see status as read-only badge
        // Status can only be changed through action buttons
        return (
          <Badge variant="outline" className={jobStatusColors[job.jobStatus]}>
            {jobStatusLabels[job.jobStatus] || job.jobStatus}
          </Badge>
        );

      case "paymentStatus":
        if (canEditField()) {
          const currentPaymentStatus = getCurrentValue(
            job,
            "paymentStatus"
          ) as string;
          return (
            <EditableSelect
              value={currentPaymentStatus}
              options={paymentStatusOptions}
              onSave={(value) =>
                handleFieldChange(job.id, "paymentStatus", value)
              }
              className="w-[100%]"
            />
          );
        }
        return (
          <Badge
            variant="outline"
            className={paymentStatusColors[job.paymentStatus]}
          >
            {
              paymentStatusOptions.find((o) => o.value === job.paymentStatus)
                ?.label
            }
          </Badge>
        );

      case "note":
        return (
          <span className="max-w-[200px] truncate" title={job.note}>
            {job.note || "—"}
          </span>
        );

      case "assignedEmployee":
        if (canEditField() && employees && employees.length > 0) {
          const currentAssignee = getCurrentValue(job, "assignee") as any;
          // Get employee id from pending changes or from original job
          const employeeId = currentAssignee?.id || job.assignee?.id;

          return (
            <EditableSelect
              value={employeeId?.toString() || ""}
              options={employees.map((e) => ({
                value: e.id.toString(),
                label: e.fullName,
              }))}
              onSave={(value) => {
                // Find the full employee object and pass it
                const employee = employees.find(
                  (e) => e.id.toString() === value
                );
                if (employee) {
                  handleFieldChange(job.id, "assignee", employee);
                }
              }}
              className="w-[150px]"
            />
          );
        }

        return (
          <span>
            {employees?.find((e) => e.id === job.assignee?.id)?.fullName ||
              job.assignee?.fullName}
          </span>
        );

      case "qa":
        if (canEditField() && qaList && qaList.length > 0) {
          const currentQA = getCurrentValue(job, "qualifiedAssignee") as any;
          // Get QA id from pending changes or from original job
          const qaId = currentQA?.id || job.qualifiedAssignee?.id;

          return (
            <EditableSelect
              value={qaId?.toString() || ""}
              options={qaList.map((q) => ({
                value: q.id.toString(),
                label: q.fullName,
              }))}
              onSave={(value) => {
                // Find the full QA object and pass it
                const qa = qaList.find((q) => q.id.toString() === value);
                if (qa) {
                  handleFieldChange(job.id, "qualifiedAssignee", qa);
                }
              }}
              className="w-[150px]"
            />
          );
        }
        return (
          <span>
            {qaList?.find((q) => q.id === job.qualifiedAssignee?.id)
              ?.fullName || job.qualifiedAssignee?.fullName}
          </span>
        );

      case "actions":
        return (
          <ActionCell
            ref={(ref) => {
              if (ref) actionCellRefs.current[job.id] = ref;
            }}
            job={job}
            userRole={userRole}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
            onJobAction={onJobAction}
            onSave={handleSaveChanges}
            onCancel={handleCancelChanges}
            pendingChangesRef={pendingChangesRef}
            getCurrentValue={getCurrentValue}
          />
        );

      default:
        return null;
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">
          Không tìm thấy công việc
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Nhấn &quot;Thêm Công Việc&quot; để tạo công việc đầu tiên
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column}
                  className={`${
                    column === "actions" ? "text-right" : ""
                  } border-r last:border-r-0 text-center`}
                  style={{ fontWeight: "700" }}
                >
                  {columnLabels[column]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={`${job.id}-${column}`}
                    className="border-r last:border-r-0"
                  >
                    {renderCell(job, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Công việc sẽ bị xóa vĩnh viễn
              khỏi danh sách của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Detail Preview Dialog */}
      <JobDetailDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        job={previewJob}
      />
    </>
  );
}
