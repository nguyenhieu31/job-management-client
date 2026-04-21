"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import type { UserRole, JobResponse, CustomerInfo } from "@/types/jobs";
import { PAYROLL_DAY_COLUMN } from "@/types/jobs";
import { formatCurrency, formatCurrencyVND, formatDate } from "@/lib/utils";
import { EmployeeResponse } from "@/types/employees";
import SearchableDropdown from "../ui/search-able-dropdown";

interface JobTableProps {
  jobs: JobResponse[];
  userRole: UserRole;
  employees?: EmployeeResponse[];
  qaList?: EmployeeResponse[];
  customers?: CustomerInfo[];
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
  note: "Ghi Chú",
  qaNote: "Ghi Chú QA",
  assignedEmployee: "Người Được Giao",
  qa: "QA",
  actions: "Hành Động",
};

export const filePriceOptions = [
  { id: 1, name: 0.7 },
  { id: 2, name: 0.76 },
  { id: 3, name: 0.6 },
  { id: 4, name: 0.5 },
  { id: 5, name: 1 },
  { id: 6, name: 13 },
  { id: 7, name: 5 },
  { id: 8, name: 4 },
];

export function PayrollDayTable({
  jobs,
  userRole,
  employees,
  qaList,
  customers = [],
}: JobTableProps) {
  const [selectedJobIds, setSelectedJobIds] = useState<Set<number>>(new Set());
  const [totalSelectedPrice, setTotalSelectedPrice] = useState<number>(0);
  const [totalSelectedPriceQa, setTotalSelectedPriceQa] = useState<number>(0);
  const [totalSelectedPriceCustomer, setTotalSelectedPriceCustomer] = useState<number>(0);
  const [totalOutputEmployees, setTotalOutputEmployees] = useState<number>(0);
  const [totalOutputQas, setTotalOutputQas] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Track pending changes for Manager role using useRef to avoid re-renders
  const pendingChangesRef = useRef<Record<number, Partial<JobResponse>>>({});
  // Ref to track action cell components
  const actionCellRefs = useRef<Record<number, any>>({});

  // Get visible columns based on role
  const visibleColumns = PAYROLL_DAY_COLUMN;

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
      return sum + (job?.payPerFile || 0) * (job?.outputNumber || 0);
    }, 0);
    setTotalSelectedPrice(total);
    const totalQa = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.payPerFileQa || 0) * (job?.qaOutputNumber || 0);
    }, 0);
    setTotalSelectedPriceQa(totalQa);
    const totalCustomer = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.filePrice || 0) * (job?.outputNumber || 0);
    }, 0);
    setTotalSelectedPriceCustomer(totalCustomer);
    const totalOutput = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.outputNumber || 0);
    }, 0);
    setTotalOutputEmployees(totalOutput);
    const totalOutputQas = Array.from(newSelected).reduce((sum, id) => {
      const job = jobs.find((j) => j.id === id);
      return sum + (job?.qaOutputNumber || 0);
    }, 0);
    setTotalOutputQas(totalOutputQas);
  };

  const handleSelectAll = () => {
    if (selectedJobIds.size === jobs.length) {
      setSelectedJobIds(new Set());
      setTotalSelectedPrice(0);
      setTotalSelectedPriceQa(0);
      setTotalSelectedPriceCustomer(0);
      setTotalOutputEmployees(0);
      setTotalOutputQas(0);
    } else {
      setSelectedJobIds(new Set(jobs.map((j) => j.id)));
      const total = jobs.reduce((sum, job) => {
        return sum + (job.payPerFile || 0) * (job.outputNumber || 0);
      }, 0);
      setTotalSelectedPrice(total);
      const totalQa = jobs.reduce((sum, job) => {
        return sum + (job.payPerFileQa || 0) * (job.qaOutputNumber || 0);
      }, 0);
      setTotalSelectedPriceQa(totalQa);
      const totalCustomer = jobs.reduce((sum, job) => {
        return sum + (job.filePrice || 0) * (job.outputNumber || 0);
      }, 0);
      setTotalSelectedPriceCustomer(totalCustomer);
      const totalOutput = jobs.reduce((sum, job) => {
        return sum + (job.outputNumber || 0);
      }, 0);
      setTotalOutputEmployees(totalOutput);
      const totalOutputQas = jobs.reduce((sum, job) => {
        return sum + (job.qaOutputNumber || 0);
      }, 0);
      setTotalOutputQas(totalOutputQas);
    }
  };

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
    [handleFieldChange, qaList]
  );

  const renderCell = (job: JobResponse, column: string) => {
    // console.log("Rendering cell for job", job.id, "column", column);
    switch (column) {
      case "code":
        return <span className="font-medium">#{job.code}</span>;

      case "date":
        return <span>{formatDate(job.createdAt.toString())}</span>;

      case "customerName":
        // if (canEditField() && customers.length > 0 && userRole === "manager") {
        //   return (
        //     <SearchableDropdown
        //       options={customerOptions}
        //       placeholder="Tìm kiếm khách hàng..."
        //       onChange={createCustomerChangeHandler(job.id)}
        //       defaultValue={job.customer}
        //       className="w-55"
        //       type="text"
        //     />
        //   );
        // }
        return (
          <span>
            {job.customer && job.customer.name ? job.customer.name : ""}
          </span>
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
          <span className="font-medium">{formatCurrency(job.filePrice * job.outputNumber)}</span>
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
            {job.doneLink || ""}
          </a>
        );

      case "inputCount":
        // Employee and QA: read-only
        return <span>{job.inputNumber}</span>;

      case "outputCount":
        // Manager and QA: read-only
        return <span>{job.outputNumber}</span>;

      case "qaOutputNumber":
        // Manager and QA: read-only
        return <span>{job.qaOutputNumber}</span>;

      case "fileCount":
        return <span>{job.fileCount}</span>;

      case "filePrice":
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

      case "note":
        return (
          <span className="max-w-[400px] truncate block" title={job.note}>
            {job.note || ""}
          </span>
        );

      case "qaNote":
        return (
          <span
            className="max-w-[400px] truncate block"
            title={job.qaNote ? job.qaNote : ""}
          >
            {job.qaNote || ""}
          </span>
        );

      case "assignedEmployee":
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
      {userRole === "manager" && selectedJobIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium">
            Đã chọn {selectedJobIds.size} công việc
          </span>
          <span className="text-sm font-medium">
            Tổng tiền khách hàng: {formatCurrency(totalSelectedPriceCustomer)}
          </span>
          <span className="text-sm font-medium">
            Tổng tiền nhân viên: {formatCurrencyVND(totalSelectedPrice)}
          </span>
          <span className="text-sm font-medium">
            Tổng output nhân viên: {totalOutputEmployees}
          </span>
          <span className="text-sm font-medium">
            Tổng output QA: {totalOutputQas}
          </span>
          <span className="text-sm font-medium">
            Tổng tiền QA: {formatCurrencyVND(totalSelectedPriceQa)}
          </span>
        </div>
      )}

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {userRole === "manager" && (
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
              )}
              <TableHead className="w-12 text-center border-r font-bold">
                STT
              </TableHead>
              {visibleColumns.map((column, index) => (
                <TableHead
                  key={column + index}
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
                {userRole === "manager" && (
                  <TableCell className="w-12 text-center border-r">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.has(job.id)}
                      onChange={() => handleToggleSelect(job.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableCell>
                )}
                <TableCell className="w-12 text-center border-r font-medium">
                  {index + 1}
                </TableCell>
                {visibleColumns.map((column, index) => (
                  <TableCell
                    key={`${job.id}-${column}-${index}`}
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
    </>
  );
}
