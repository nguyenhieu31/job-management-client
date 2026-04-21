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
import { Check, Eye, Trash2 } from "lucide-react";
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
import {
  formatCurrency,
  formatCurrencyVND,
  formatDate,
  getFirstDayOfMonth,
} from "@/lib/utils";
import { EmployeeResponse } from "@/types/employees";
import { JobDetailDialog } from "./job-detail-dialog";
import SearchableDropdown from "../ui/search-able-dropdown";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  DeleteJobByIdAction,
  DeleteMultipleJobsAction,
  GetAllJobsAction,
  GetAllJobsByAssigneeAction,
  UpdateGridViewJobAction,
  UpdatePaymentEmployeeMultipleJobsAction,
  UpdatePaymentMultipleJobsAction,
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
  PENDING: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  DONE: "Đang đợi xét duyệt",
  IN_REVIEW: "Nhận xét duyệt",
  REVIEWED: "Hoàn thành xét duyệt",
  COMPLETED: "Đã hoàn thành",
};

const paymentStatusColors = {
  UNPAID: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  INVOICE_SENT:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  INVOICE_DRAFT:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const paymentStatusOptions = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "INVOICE_SENT", label: "Đã gửi hóa đơn" },
  { value: "PAID", label: "Đã thanh toán" },
];

const paymentEmployeeOptions = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
];

const paymentEmployeeColors = {
  UNPAID: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  PAID: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
};

const columnLabels: Record<string, string> = {
  code: "Mã Công Việc",
  date: "Ngày",
  customerName: "Tên Khách Hàng",
  caseName: "Tên Job",
  workRequest: "Style hàng",
  totalPrice: "Tổng Giá",
  linkInput: "Link Input",
  linkDone: "Link Done",
  inputCount: "Số Lượng Input",
  outputCount: "Số Lượng Output",
  qaOutputNumber: "Số Lượng QA Output",
  fileCount: "Số Lượng File",
  filePrice: "Giá File",
  payPerFile: "Trả/File",
  payPerFileQa: "Trả/File QA",
  totalPayPerFile: "Tổng Trả",
  totalPayPerFileQa: "Tổng Trả QA",
  jobStatus: "Tình Trạng Công Việc",
  paymentStatus: "Tình Trạng Thanh Toán",
  paymentEmployee: "Thanh Toán NV",
  note: "Ghi Chú",
  qaNote: "Ghi Chú QA",
  employeeNote: "Thuê ngoài",
  assignedEmployee: "Người Được Giao",
  qa: "QA",
  deadline: "Deadline",
  actions: "Hành Động",
};

export const filePriceOptions = [
  { id: 1, name: 0.7 },
  { id: 2, name: 0.75 },
  { id: 3, name: 0.76 },
  { id: 4, name: 0.6 },
  { id: 5, name: 0.5 },
  { id: 6, name: 1 },
  { id: 7, name: 13 },
  { id: 8, name: 5 },
  { id: 9, name: 4 },
];

export const filePriceEmployeeOptions = [
  { id: 1, name: 8000 },
  { id: 2, name: 10000 },
  { id: 3, name: 6000 },
  { id: 4, name: 50000 },
  { id: 5, name: 100000 },
  { id: 6, name: 120000 },
];

export const filePriceQaOptions = [
  { id: 1, name: 2000 },
  { id: 2, name: 3000 },
  { id: 3, name: 4000 },
  { id: 4, name: 5000 },
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
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkMarkAsPaidDialogOpen, setBulkMarkAsPaidDialogOpen] =
    useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<number>>(new Set());
  const [totalSelectedPrice, setTotalSelectedPrice] = useState<number>(0);
  const [totalSelectedPriceCustomer, setTotalSelectedPriceCustomer] =
    useState<number>(0);
  const [totalOutputEmployees, setTotalOutputEmployees] = useState<number>(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState<JobResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<"employeeNote" | null>(null);
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { roleName, email } = useAppSelector((state) => state.authenticate);
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

  // Check if user can edit employeeNote and paymentEmployee (manager and special)
  const canEditSpecialFields = (job: JobResponse) => {
    return (
      (userRole === "manager" || userRole === "special") &&
      job.jobStatus !== "PENDING"
    );
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
    [customers],
  );

  // Save pending changes
  const handleSaveChanges = useCallback(
    async (jobId: number) => {
      const changes = pendingChangesRef.current[jobId];
      if (changes) {
        const job = jobs.find((j) => j.id === jobId);
        const assigneeId = changes.assignee?.id;
        const qualifiedAssigneeId = changes.qualifiedAssignee?.id;

        // Check if user cleared assignee or QA fields
        const isDeleteAssignee = !!(
          job?.assignee?.id &&
          "assignee" in changes &&
          !assigneeId
        );
        const isDeleteQualifiedAssignee = !!(
          job?.qualifiedAssignee?.id &&
          "qualifiedAssignee" in changes &&
          !qualifiedAssigneeId
        );

        const payload = {
          jobId: jobId,
          assigneeId: assigneeId
            ? Number.parseInt(assigneeId.toString())
            : null,
          customerId: changes.customer?.id || null,
          filePrice: changes.filePrice || null,
          inputNumber: changes.inputNumber || null,
          outputNumber: changes.outputNumber || null,
          qaOutputNumber: changes.qaOutputNumber || null,
          qualifiedAssigneeId: qualifiedAssigneeId
            ? Number.parseInt(qualifiedAssigneeId.toString())
            : null,
          paymentStatus: changes.paymentStatus || null,
          paymentEmployee: changes.paymentEmployee || "",
          doneLink: changes.doneLink || "",
          employeeNote: changes.employeeNote || null,
          isDeleteAssignee: isDeleteAssignee || undefined,
          isDeleteQualifiedAssignee: isDeleteQualifiedAssignee || undefined,
        };
        // Dispatch API call
        const res = await dispatch(UpdateGridViewJobAction(payload));
        if (res.meta.requestStatus === "fulfilled") {
          // Clear pending changes AFTER API succeeds
          delete pendingChangesRef.current[jobId];
          // Trigger re-render to show updated values from API
          setUpdateTrigger((prev) => prev + 1);
          // Force re-render action cell
          if (actionCellRefs.current[jobId]) {
            actionCellRefs.current[jobId].forceUpdate?.();
          }
          // toast.success("Cập nhật công việc thành công");
        } else {
          toast.error("Lỗi khi cập nhật công việc");
          console.error("res", res);
        }
      }
    },
    [dispatch, jobs],
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
    [],
  );

  const handleDeleteClick = (id: number) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleToggleSelect = (jobId: number) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobIds(newSelected);
    // Update total selected price
    const total = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      if (userRole !== "manager") {
        if (userRole !== "qa") {
          return sum + (job?.payPerFile || 0) * (job?.outputNumber || 0);
        } else {
          return sum + (job?.payPerFileQa || 0) * (job?.qaOutputNumber || 0);
        }
      }
      return (
        sum +
        (job?.payPerFile || 0) * (job?.outputNumber || 0) +
        (job?.payPerFileQa || 0) * (job?.qaOutputNumber || 0)
      );
    }, 0);
    setTotalSelectedPrice(total);
    const totalCustomer = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.filePrice || 0) * (job?.outputNumber || 0);
    }, 0);
    setTotalSelectedPriceCustomer(totalCustomer);
    const totalOutputEmp = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.outputNumber || 0);
    }, 0);
    setTotalOutputEmployees(totalOutputEmp);
  };

  const handleSelectAll = () => {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set());
      setTotalSelectedPrice(0);
      setTotalSelectedPriceCustomer(0);
      setTotalOutputEmployees(0);
    } else {
      setSelectedJobIds(new Set(jobs.map((j) => j.id)));
      const total = jobs.reduce((sum, job) => {
        if (userRole !== "manager") {
          if (userRole !== "qa") {
            return sum + (job?.payPerFile || 0) * (job?.outputNumber || 0);
          } else {
            return sum + (job?.payPerFileQa || 0) * (job?.qaOutputNumber || 0);
          }
        }
        return (
          sum +
          (job?.payPerFile || 0) * (job?.outputNumber || 0) +
          (job?.payPerFileQa || 0) * (job?.qaOutputNumber || 0)
        );
      }, 0);
      setTotalSelectedPrice(total);
      const totalCustomer = jobs.reduce((sum, job) => {
        return sum + (job.filePrice || 0) * (job.outputNumber || 0);
      }, 0);
      setTotalSelectedPriceCustomer(totalCustomer);
      const totalOutputEmp = jobs.reduce((sum, job) => {
        return sum + (job.outputNumber || 0);
      }, 0);
      setTotalOutputEmployees(totalOutputEmp);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedJobIds.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkMarkAsPaidClick = () => {
    if (selectedJobIds.size > 0) {
      setBulkMarkAsPaidDialogOpen(true);
    }
  };

  // const handleConfirmBulkDelete = async () => {
  //   for (const jobId of selectedJobIds) {
  //     await dispatch(DeleteJobByIdAction({ id: jobId }));
  //   }
  //   if (roleName === "MANAGER") {
  //     await dispatch(
  //       GetAllJobsAction({
  //         pageNumber: 0,
  //         pageSize: 10,
  //       })
  //     );
  //   }
  //   setBulkDeleteDialogOpen(false);
  //   setSelectedJobIds(new Set());
  //   setTotalSelectedPrice(0);
  //   setTotalSelectedPriceCustomer(0);
  // };

  const handleConfirmBulkDeleteMultiple = async () => {
    if (roleName === "MANAGER") {
      await dispatch(
        DeleteMultipleJobsAction({ ids: Array.from(selectedJobIds) }),
      );
      await dispatch(
        GetAllJobsAction({
          pageNumber: 0,
          pageSize: 10,
          fromDate: getFirstDayOfMonth(),
        }),
      );
    }
    setBulkDeleteDialogOpen(false);
    setSelectedJobIds(new Set());
    setTotalSelectedPrice(0);
  };

  const handleConfirmBulkMarkAsPaid = async () => {
    if (roleName === "SPECIAL") {
      await dispatch(
        UpdatePaymentEmployeeMultipleJobsAction({
          ids: Array.from(selectedJobIds),
        }),
      );
      await dispatch(
        GetAllJobsByAssigneeAction({
          pageNumber: 0,
          pageSize: 10,
          email: email || "",
        }),
      );
    } else if (roleName === "MANAGER") {
      await dispatch(
        UpdatePaymentMultipleJobsAction({ ids: Array.from(selectedJobIds) }),
      );
      await dispatch(
        GetAllJobsAction({
          pageNumber: 0,
          pageSize: 10,
          fromDate: getFirstDayOfMonth(),
        }),
      );
    }
    setBulkMarkAsPaidDialogOpen(false);
    setSelectedJobIds(new Set());
    setTotalSelectedPrice(0);
    setTotalSelectedPriceCustomer(0);
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
            fromDate: getFirstDayOfMonth(),
          }),
        );
      }
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handlePreviewClick = (job: JobResponse) => {
    if (
      ((userRole === "employee" || userRole === "special") &&
        job.jobStatus === "PENDING") ||
      (userRole === "qa" && job.jobStatus === "DONE")
    ) {
      toast.info("Nhận job này để xem chi tiết");
      return;
    }
    setPreviewJob(job);
    setPreviewDialogOpen(true);
  };

  // Memoize customer options to avoid recreating array on every render
  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, name: c.name })),
    [customers],
  );

  // Create memoized onChange handlers for each job to avoid inline function creation
  const createInputNumberHandler = useCallback(
    (jobId: number) => (value: number) => {
      handleFieldChange(jobId, "inputNumber", value);
    },
    [handleFieldChange],
  );

  const createOutputNumberHandler = useCallback(
    (jobId: number) => (value: number) => {
      handleFieldChange(jobId, "outputNumber", value);
    },
    [handleFieldChange],
  );

  const createQaOutputNumberHandler = useCallback(
    (jobId: number) => (value: number) => {
      handleFieldChange(jobId, "qaOutputNumber", value);
    },
    [handleFieldChange],
  );

  const createCustomerChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      handleFieldChange(jobId, "customer", value);
    },
    [handleFieldChange],
  );

  const createFilePriceChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      handleFieldChange(jobId, "filePrice", value);
    },
    [handleFieldChange],
  );

  const createEmployeeChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      if (value === null) {
        // User cleared the field - set to null to indicate deletion
        handleFieldChange(jobId, "assignee", null);
        return;
      }
      const employee = employees?.find((e) => e.id === value.id);
      handleFieldChange(jobId, "assignee", employee);
    },
    [handleFieldChange, employees],
  );

  const createQaChangeHandler = useCallback(
    (jobId: number) => (value: any) => {
      if (value === null) {
        // User cleared the field - set to null to indicate deletion
        handleFieldChange(jobId, "qualifiedAssignee", null);
        return;
      }
      const qa = qaList?.find((q) => q.id === value.id);
      handleFieldChange(jobId, "qualifiedAssignee", qa);
    },
    [handleFieldChange, qaList],
  );

  // Handle saving from edit dialog
  const handleSaveEditDialog = () => {
    if (editVideoId !== null && editField !== null) {
      handleFieldChange(editVideoId, editField, editValue);
      setEditDialogOpen(false);
      setEditVideoId(null);
      setEditField(null);
      setEditValue("");
    }
  };

  // Handle cancel edit dialog
  const handleCancelEditDialog = () => {
    setEditDialogOpen(false);
    setEditVideoId(null);
    setEditField(null);
    setEditValue("");
  };

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
            <div className="max-w-[250px]">
              <SearchableDropdown
                options={customerOptions}
                placeholder="Tìm kiếm khách hàng..."
                onChange={createCustomerChangeHandler(job.id)}
                defaultValue={job.customer}
                className="w-full"
                type="text"
              />
            </div>
          );
        }
        return (
          <div
            className="max-w-[250px] text-ellipsis whitespace-nowrap"
            title={job.customer?.name || ""}
          >
            {job.customer && job.customer.name ? job.customer.name : "N/A"}
          </div>
        );

      case "caseName":
        return <span className="max-w-[200px] truncate">{job.caseName}</span>;

      case "workRequest":
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">
              {job.workRequest?.categoryName || ""}
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
            {job.inputLink || ""}
          </a>
        );

      case "linkDone":
        // EMPLOYEE can edit Link Done when job is IN_PROGRESS
        if (
          (userRole === "employee" || userRole === "special") &&
          job.jobStatus === "IN_PROGRESS"
        ) {
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
            {job.doneLink || ""}
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
        if (
          (userRole === "employee" || userRole === "special") &&
          job.jobStatus === "IN_PROGRESS"
        ) {
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

      case "qaOutputNumber":
        // QA can edit Output Count, Manager and Employee cannot
        if (userRole === "qa" && job.jobStatus === "IN_REVIEW") {
          return (
            <EditableInput
              value={getCurrentValue(job, "qaOutputNumber") as number}
              onChange={createQaOutputNumberHandler(job.id)}
              className="border-green-200 focus:border-green-400"
            />
          );
        }
        // Manager and QA: read-only
        return <span>{job.qaOutputNumber}</span>;

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

      case "payPerFileQa":
        return <span>{formatCurrencyVND(job.payPerFileQa)}</span>;

      case "totalPayPerFile":
        return (
          <span className="font-medium">
            {formatCurrencyVND(job.totalPayPerFile)}
          </span>
        );

      case "totalPayPerFileQa":
        return (
          <span className="font-medium">
            {formatCurrencyVND(job.totalPayPerFileQa)}
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
            "paymentStatus",
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

      case "paymentEmployee":
        if (canEditSpecialFields(job)) {
          const currentPaymentEmployee = getCurrentValue(
            job,
            "paymentEmployee",
          ) as string;
          // Get color class based on current value
          const colorClass =
            currentPaymentEmployee === "PAID"
              ? "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700";
          return (
            <div className={`rounded-md ${colorClass} p-1`}>
              <EditableSelect
                value={currentPaymentEmployee}
                options={paymentEmployeeOptions}
                onSave={(value) =>
                  handleFieldChange(job.id, "paymentEmployee", value)
                }
                className="w-[100%]"
              />
            </div>
          );
        }
        return (
          <Badge
            variant="outline"
            className={paymentEmployeeColors[job.paymentEmployee]}
          >
            {
              paymentEmployeeOptions.find(
                (o) => o.value === job.paymentEmployee,
              )?.label
            }
          </Badge>
        );

      case "note":
        // Strip HTML tags for table preview, show full rich content in detail dialog
        const noteText = job.note
          ? job.note
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : "";
        return (
          <span
            className="max-w-[400px] truncate block cursor-pointer"
            title={noteText}
            onClick={() => handlePreviewClick(job)}
          >
            {noteText || ""}
          </span>
        );

      case "qaNote":
        return (
          <span
            className="max-w-[400px] truncate block cursor-pointer"
            title={job.qaNote ? job.qaNote : ""}
            onClick={() => handlePreviewClick(job)}
          >
            {job.qaNote || ""}
          </span>
        );

      case "employeeNote":
        const currentEmployeeNote = getCurrentValue(
          job,
          "employeeNote",
        ) as string;
        if (canEditSpecialFields(job)) {
          return (
            <div
              className="max-w-[400px] truncate cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
              onClick={() => {
                setEditVideoId(job.id);
                setEditField("employeeNote");
                setEditValue(currentEmployeeNote || "");
                setEditDialogOpen(true);
              }}
              title="Click để chỉnh sửa"
            >
              {currentEmployeeNote || "Nhấp để nhập..."}
            </div>
          );
        }
        return (
          <span
            className="max-w-[400px] truncate block"
            title={currentEmployeeNote || ""}
          >
            {currentEmployeeNote || ""}
          </span>
        );

      case "assignedEmployee":
        if (canEditField() && employees && employees.length > 0) {
          const currentAssignee = getCurrentValue(job, "assignee") as any;

          return (
            <SearchableDropdown
              options={employees.map((e) => ({
                id: e.id,
                name: e.fullName,
              }))}
              placeholder="Tìm kiếm nhân viên..."
              onChange={createEmployeeChangeHandler(job.id)}
              defaultValue={
                currentAssignee
                  ? {
                      id: currentAssignee.id,
                      name: currentAssignee.fullName,
                    }
                  : job.assignee
                    ? {
                        id: job.assignee.id,
                        name: job.assignee.fullName,
                      }
                    : null
              }
              className="w-[150px]"
              type="text"
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

          return (
            <SearchableDropdown
              options={qaList.map((q) => ({
                id: q.id,
                name: q.fullName,
              }))}
              placeholder="Tìm kiếm QA..."
              onChange={createQaChangeHandler(job.id)}
              defaultValue={
                currentQA
                  ? {
                      id: currentQA.id,
                      name: currentQA.fullName,
                    }
                  : job.qualifiedAssignee
                    ? {
                        id: job.qualifiedAssignee.id,
                        name: job.qualifiedAssignee.fullName,
                      }
                    : null
              }
              className="w-[150px]"
              type="text"
            />
          );
        }
        return (
          <span>
            {qaList?.find((q) => q.id === job.qualifiedAssignee?.id)
              ?.fullName || job.qualifiedAssignee?.fullName}
          </span>
        );

      case "deadline":
        if (!job.deadline) {
          return <span className="text-muted-foreground"></span>;
        }
        // deadline is stored as time string like "09:08" or full datetime
        const deadlineTime = job.deadline.includes(":")
          ? job.deadline.substring(
              job.deadline.indexOf(" ") + 1,
              job.deadline.indexOf(" ") + 6,
            ) || job.deadline.substring(0, 5)
          : job.deadline;

        // Format time display (HH:mm)
        const formattedTime =
          deadlineTime.length >= 5
            ? deadlineTime.substring(0, 5)
            : deadlineTime;

        // Determine color based on job status
        const deadlineColorClass =
          job.jobStatus === "PENDING" || job.jobStatus === "IN_PROGRESS"
            ? "text-red-600 dark:text-red-400"
            : job.jobStatus === "DONE" ||
                job.jobStatus === "IN_REVIEW" ||
                job.jobStatus === "REVIEWED"
              ? "text-green-600 dark:text-green-400"
              : "text-foreground";

        return (
          <span className={`text-sm font-medium ${deadlineColorClass}`}>
            {formattedTime}
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
      {selectedJobIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium">
            Đã chọn {selectedJobIds.size} công việc
          </span>
          {userRole === "manager" && (
            <span className="text-sm font-medium">
              Tổng tiền khách hàng: {formatCurrency(totalSelectedPriceCustomer)}
            </span>
          )}

          <span className="text-sm font-medium">
            Tổng tiền: {formatCurrencyVND(totalSelectedPrice)}
          </span>

          <span className="text-sm font-medium">
            Tổng output nhân viên: {totalOutputEmployees}
          </span>
          {userRole === "manager" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Xóa được chọn
            </Button>
          )}
          {(userRole === "special" || userRole === "manager") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkMarkAsPaidClick}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Đánh dấu đã thanh toán
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center border-r">
                <input
                  type="checkbox"
                  checked={
                    selectedJobIds.size === jobs.length && jobs.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedJobIds.size > 0 &&
                        selectedJobIds.size < jobs.length;
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-12 text-center border-r font-bold">
                STT
              </TableHead>
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
            {jobs.map((job, index) => (
              <TableRow
                key={job.id}
                className={
                  userRole === "manager" && selectedJobIds.has(job.id)
                    ? "bg-blue-50 dark:bg-blue-950"
                    : ""
                }
              >
                <TableCell className="w-12 text-center border-r">
                  <input
                    type="checkbox"
                    checked={selectedJobIds.has(job.id)}
                    onChange={() => handleToggleSelect(job.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="w-12 text-center border-r font-medium">
                  {index + 1}
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={`${job.id}-${column}`}
                    className={`border-r last:border-r-0 ${column === "customerName" ? "relative" : ""}`}
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

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa Hàng Loạt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa {selectedJobIds.size} công việc. Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDeleteMultiple}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa Tất Cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkMarkAsPaidDialogOpen}
        onOpenChange={setBulkMarkAsPaidDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác Nhận Đánh Dấu Đã Thanh Toán Hàng Loạt
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp đánh dấu {selectedJobIds.size} công việc là đã thanh toán.
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkMarkAsPaid}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Đánh Dấu Tất Cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog for CaseName and Note */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Chỉnh Sửa thuê ngoài</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập thông tin bên dưới và nhấn Lưu để cập nhật.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Nhập thuê ngoài..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEditDialog}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveEditDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lưu
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
