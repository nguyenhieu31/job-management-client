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
import {
  Eye,
  Trash2,
  Save,
  X,
  PlayCircle,
  CheckCircle,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, Fragment } from "react";
import type {
  UserRole,
  VideoAction,
  VideoResponse,
  CustomerInfo,
} from "@/types/videos";
import { ROLE_COLUMNS } from "@/types/videos";
import { EditableSelect } from "./editable-select";
import { EditableInput } from "./editable-input";
import { formatCurrency, formatCurrencyVND, formatDate, getFirstDayOfMonth } from "@/lib/utils";
import { EmployeeResponse } from "@/types/employees";
import { VideoDetailDialog } from "./video-detail-dialog";
import SearchableDropdown from "../ui/search-able-dropdown";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  DeleteVideoByIdAction,
  GetAllVideosAction,
  GetAllVideosByAssigneeAction,
  UpdateGridViewVideoAction,
  UpdatePaymentEmployeeMultipleVideosAction,
  UpdatePaymentMultipleVideosAction,
} from "@/store/slice/videos/Videos";
import { toast } from "react-toastify";

interface VideoTableProps {
  videos: VideoResponse[];
  userRole: UserRole;
  employees?: EmployeeResponse[];
  customers?: CustomerInfo[];
  onVideoAction: (videoId: number, action: VideoAction) => void;
}

const videoStatusColors: Record<string, string> = {
  PENDING:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  IN_PROGRESS:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  DONE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

const videoStatusLabels: Record<string, string> = {
  PENDING: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  DONE: "Đang đợi xét duyệt",
  COMPLETED: "Đã hoàn thành",
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

// Helper function to render text with clickable links
const renderTextWithLinks = (text: string) => {
  if (!text) return null;
  
  // Regex to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Reset regex lastIndex
      urlRegex.lastIndex = 0;
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
};

export function VideoTable({
  videos,
  userRole,
  employees,
  customers = [],
  onVideoAction,
}: VideoTableProps) {
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
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState<VideoResponse | null>(null);
  const { roleName, email } = useAppSelector((state) => state.authenticate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState<
    "caseName" | "note" | "employeeNote" | null
  >(null);
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
console.log("editValue: ", editValue)
  // Track formatted values for payPerFile inputs
  const [payPerFileInputs, setPayPerFileInputs] = useState<
    Record<number, string>
  >({});

  // Track pending changes for Manager role using useRef to avoid re-renders
  const pendingChangesRef = useRef<Record<number, Partial<VideoResponse>>>({});

  // Helper functions for VND formatting
  const formatVNDInput = (value: string): string => {
    const numericValue = value.replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseVNDInput = (value: string): number => {
    const numericValue = value.replace(/\./g, "");
    return parseInt(numericValue) || 0;
  };
  // Ref to track action cell components

  // Get visible columns based on role
  const visibleColumns =
    ROLE_COLUMNS[userRole as keyof typeof ROLE_COLUMNS] ||
    ROLE_COLUMNS.employee;

  // All roles can edit fields inline (except STT, code, date)

  // Check if user can edit employeeNote and paymentEmployee (manager and special)
  const canEditSpecialFields = (video: VideoResponse) => {
    return (
      (userRole === "manager" || userRole === "special") &&
      video.jobStatus !== "PENDING"
    );
  };

  // Handle field change (store in pending changes instead of immediate save)
  const handleFieldChange = useCallback(
    (videoId: number, field: string, value: string | number | any) => {
      if (field === "customer") {
        if (value === null) return;
        const customer = customers.find((c) => c.id === value.id);
        pendingChangesRef.current[videoId] = {
          ...(pendingChangesRef.current[videoId] || {}),
          [field]: customer,
        };
      } else if (field === "filePrice") {
        if (value === null) return;
        pendingChangesRef.current[videoId] = {
          ...(pendingChangesRef.current[videoId] || {}),
          [field]: value.name,
        };
      } else {
        console.log("value", value);
        pendingChangesRef.current[videoId] = {
          ...(pendingChangesRef.current[videoId] || {}),
          [field]: value,
        };
      }
      // Trigger re-render to update UI
      setUpdateTrigger((prev) => prev + 1);
    },
    [customers]
  );

  // Save pending changes
  const handleSaveChanges = useCallback(
    async (videoId: number) => {
      const changes = pendingChangesRef.current[videoId];
      if (changes) {
        const job = videos.find((j) => j.id === videoId);
        const assigneeId = changes.assignee?.id;

        // Check if user cleared assignee or QA fields
        const isDeleteAssignee = !!(
          job?.assignee?.id &&
          "assignee" in changes &&
          !assigneeId
        );

        const payload = {
          jobId: videoId,
          assigneeId: assigneeId
            ? Number.parseInt(assigneeId.toString())
            : null,
          caseName: changes.caseName || null,
          note: changes.note || null,
          employeeNote: changes.employeeNote || null,
          customerId: changes.customer?.id || null,
          filePrice: changes.filePrice || null,
          inputNumber:
            changes.inputNumber !== undefined ? changes.inputNumber : null,
          outputNumber:
            changes.outputNumber !== undefined ? changes.outputNumber : null,
          paymentStatus: changes.paymentStatus || null,
          paymentEmployee: changes.paymentEmployee || null,
          doneLink: changes.doneLink || "",
          inputLink: changes.inputLink || null,
          payPerFile: changes.payPerFile || null,
          isDeleteAssignee: isDeleteAssignee || undefined,
        };
        // Dispatch API call
        const res = await dispatch(UpdateGridViewVideoAction(payload));
        if (res.meta.requestStatus === "fulfilled") {
          // Clear pending changes AFTER API succeeds
          delete pendingChangesRef.current[videoId];
          // Clear formatted input values
          setPayPerFileInputs((prev) => {
            const newInputs = { ...prev };
            delete newInputs[videoId];
            return newInputs;
          });
          // Trigger re-render to show updated values from API
          setUpdateTrigger((prev) => prev + 1);
          toast.success("Cập nhật công việc thành công");
        } else {
          toast.error("Lỗi khi cập nhật công việc");
          console.error("res", res);
        }
      }
    },
    [dispatch, videos]
  );

  // Cancel pending changes
  const handleCancelChanges = useCallback((videoId: number) => {
    delete pendingChangesRef.current[videoId];
    // Clear formatted input values
    setPayPerFileInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[videoId];
      return newInputs;
    });
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  // Handle opening edit dialog
  const handleOpenEditDialog = (
    videoId: number,
    field: "caseName" | "note",
    currentValue: string
  ) => {
    setEditVideoId(videoId);
    setEditField(field);
    setEditValue(currentValue || "");
    setEditDialogOpen(true);
  };

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

  // Get current value (pending or original)
  const getCurrentValue = useCallback(
    (video: VideoResponse, field: keyof VideoResponse) => {
      if (
        pendingChangesRef.current[video.id] &&
        field in pendingChangesRef.current[video.id]
      ) {
        return pendingChangesRef.current[video.id][field];
      }
      return video[field];
    },
    []
  );

  const handleDeleteClick = (id: number) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleToggleSelect = (videoId: number) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedJobIds(newSelected);
    // Update total selected price
    const total = Array.from(newSelected).reduce((sum, id) => {
      const job = videos.find((j) => j.id === id);
      return sum + (job?.payPerFile || 0) * (job?.outputNumber || 0);
    }, 0);
    setTotalSelectedPrice(total);
    const totalCustomer = Array.from(newSelected).reduce((sum, id) => {
      const video = videos.find((j) => j.id === id);
      return sum + (video?.filePrice || 0) * (video?.outputNumber || 0);
    }, 0);
    setTotalSelectedPriceCustomer(totalCustomer);
  };

  const handleSelectAll = () => {
    if (selectedJobIds.size === videos.length) {
      setSelectedJobIds(new Set());
      setTotalSelectedPrice(0);
      setTotalSelectedPriceCustomer(0);
    } else {
      setSelectedJobIds(new Set(videos.map((j) => j.id)));
      const total = videos.reduce((sum, video) => {
        return sum + (video.payPerFile || 0) * (video.outputNumber || 0);
      }, 0);
      setTotalSelectedPrice(total);
      const totalCustomer = videos.reduce((sum, video) => {
        return sum + (video.filePrice || 0) * (video.outputNumber || 0);
      }, 0);
      setTotalSelectedPriceCustomer(totalCustomer);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedJobIds.size > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkMarkAsPaidClick = () => {
    if (selectedJobIds.size === 0) return;
    setBulkMarkAsPaidDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    for (const videoId of selectedJobIds) {
      await dispatch(DeleteVideoByIdAction(videoId));
    }
    if (roleName === "MANAGER") {
      await dispatch(
        GetAllVideosAction({
          pageNumber: 0,
          pageSize: 10,
          fromDate: getFirstDayOfMonth(),
        })
      );
    }
    setBulkDeleteDialogOpen(false);
    setSelectedJobIds(new Set());
    setTotalSelectedPrice(0);
  };

  const handleConfirmBulkMarkAsPaid = async () => {
    const videoIdsArray = Array.from(selectedJobIds);

    if (roleName === "SPECIAL") {
      await dispatch(
        UpdatePaymentEmployeeMultipleVideosAction({ ids: videoIdsArray })
      );
      await dispatch(
        GetAllVideosByAssigneeAction({
          pageNumber: 0,
          pageSize: 10,
          email: email || "",
        })
      );
    } else if (roleName === "MANAGER") {
      await dispatch(
        UpdatePaymentMultipleVideosAction({ ids: videoIdsArray })
      );
      await dispatch(
        GetAllVideosAction({
          pageNumber: 0,
          pageSize: 10,
          fromDate: getFirstDayOfMonth(),
        })
      );
    }
    setBulkMarkAsPaidDialogOpen(false);
    setSelectedJobIds(new Set());
    setTotalSelectedPrice(0);
    setTotalSelectedPriceCustomer(0);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete !== null) {
      await dispatch(DeleteVideoByIdAction(jobToDelete));
      if (roleName === undefined) return;
      if (roleName === "MANAGER") {
        await dispatch(
          GetAllVideosAction({
            pageNumber: 0,
            pageSize: 10,
            fromDate: getFirstDayOfMonth(),
          })
        );
      }
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const handlePreviewClick = (video: VideoResponse) => {
    if (
      ((userRole === "employee" || userRole === "special") &&
        video.jobStatus === "PENDING") ||
      (userRole === "qa" && video.jobStatus === "DONE")
    ) {
      toast.info("Nhận video này để xem chi tiết");
      return;
    }
    setPreviewJob(video);
    setPreviewDialogOpen(true);
  };

  // Memoize customer options to avoid recreating array on every render
  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, name: c.name })),
    [customers]
  );

  // Create memoized onChange handlers for each job to avoid inline function creation
  const createInputNumberHandler = useCallback(
    (videoId: number) => (value: number) => {
      handleFieldChange(videoId, "inputNumber", value);
    },
    [handleFieldChange]
  );

  const createOutputNumberHandler = useCallback(
    (videoId: number) => (value: number) => {
      handleFieldChange(videoId, "outputNumber", value);
    },
    [handleFieldChange]
  );

  const createCustomerChangeHandler = useCallback(
    (videoId: number) => (value: any) => {
      handleFieldChange(videoId, "customer", value);
    },
    [handleFieldChange]
  );

  const createFilePriceChangeHandler = useCallback(
    (videoId: number) => (value: any) => {
      handleFieldChange(videoId, "filePrice", value);
    },
    [handleFieldChange]
  );

  const createEmployeeChangeHandler = useCallback(
    (videoId: number) => (value: any) => {
      if (value === null) {
        // User cleared the field - set to null to indicate deletion
        handleFieldChange(videoId, "assignee", null);
        return;
      }
      const employee = employees?.find((e) => e.id === value.id);
      handleFieldChange(videoId, "assignee", employee);
    },
    [handleFieldChange, employees]
  );

  const renderCell = (video: VideoResponse, column: string) => {
    // console.log("Rendering cell for job", video.id, "column", column);
    switch (column) {
      case "code":
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">#{video.code}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreviewClick(video)}
              className="h-7 w-7 p-0"
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );

      case "date":
        return <span>{formatDate(video.createdAt.toString())}</span>;

      case "customerName":
        if (customers.length > 0 && userRole === "manager") {
          return (
            <SearchableDropdown
              options={customerOptions}
              placeholder="Tìm kiếm khách hàng..."
              onChange={createCustomerChangeHandler(video.id)}
              defaultValue={video.customer}
              className="w-55"
              type="text"
            />
          );
        }
        return (
          <span>
            {video.customer && video.customer.name ? video.customer.name : ""}
          </span>
        );

      case "caseName":
        const currentCaseName = getCurrentValue(video, "caseName") as string;
        if (userRole === "manager") {
          return (
            <div
              className="min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
              onClick={() =>
                handleOpenEditDialog(video.id, "caseName", currentCaseName)
              }
              title="Click để chỉnh sửa"
            >
              {currentCaseName || "Nhấp để nhập..."}
            </div>
          );
        }
        return (
          <div
            className="min-w-[200px]"
            onClick={() => handlePreviewClick(video)}
          >
            {currentCaseName || ""}
          </div>
        );

      case "workRequest":
        return (
          <div className="max-w-[200px]">
            <div className="font-medium truncate">
              {video.workRequest?.categoryName || ""}
            </div>
            {video.workRequest?.fileType && (
              <Badge variant="outline" className="mt-1 text-xs">
                {video.workRequest.fileType}
              </Badge>
            )}
          </div>
        );

      case "totalPrice":
        return (
          <span className="font-medium">
            {formatCurrency(video.totalPrice)}
          </span>
        );

      case "linkInput":
        // EMPLOYEE can only see link after taking job (IN_PROGRESS or later)
        if (
          (userRole === "employee" || userRole === "special") &&
          video.jobStatus === "PENDING"
        ) {
          return (
            <div className="flex items-center justify-center text-muted-foreground">
              <Eye className="h-4 w-4" />
            </div>
          );
        }

        const currentInputLink = getCurrentValue(video, "inputLink") as string;
        if (userRole === "manager") {
          return (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={currentInputLink || ""}
                onChange={(e) =>
                  handleFieldChange(video.id, "inputLink", e.target.value)
                }
                placeholder="Link input..."
                className="w-[180px] max-w-[180px] px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1"
              />
              {currentInputLink && (
                <a
                  href={currentInputLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600"
                  title="Mở link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        }

        // Employee can see link after taking job
        return (
          <a
            href={currentInputLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline max-w-[100px] truncate block"
          >
            {currentInputLink || ""}
          </a>
        );

      case "linkDone":
        const currentDoneLink = getCurrentValue(video, "doneLink") as string;

        // EMPLOYEE can edit Link Done when job is IN_PROGRESS
        if (
          (userRole === "employee" || userRole === "special") &&
          video.jobStatus === "IN_PROGRESS"
        ) {
          return (
            <div className="flex items-center gap-1">
              <input
                key={`doneLink-${video.id}`}
                type="text"
                value={currentDoneLink || ""}
                onChange={(e) =>
                  handleFieldChange(video.id, "doneLink", e.target.value)
                }
                placeholder="Dán link hoàn thành..."
                className="w-[180px] max-w-[180px] px-2 py-1 text-sm border rounded-md border-green-200 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              {currentDoneLink && (
                <a
                  href={currentDoneLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600"
                  title="Mở link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        }

        if (userRole === "manager") {
          return (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={currentDoneLink || ""}
                onChange={(e) =>
                  handleFieldChange(video.id, "doneLink", e.target.value)
                }
                placeholder="Link hoàn thành..."
                className="w-[180px] max-w-[180px] px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1"
              />
              {currentDoneLink && (
                <a
                  href={currentDoneLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600"
                  title="Mở link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          );
        }

        return (
          <a
            href={currentDoneLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline max-w-[300px] truncate block"
          >
            {currentDoneLink || ""}
          </a>
        );

      case "inputCount":
        // Manager can edit Input Count, Employee cannot
        if (userRole === "manager") {
          return (
            <EditableInput
              value={getCurrentValue(video, "inputNumber") as number}
              onChange={createInputNumberHandler(video.id)}
              className="border-blue-200 focus:border-blue-400"
            />
          );
        }
        // Employee: read-only
        return <span>{video.inputNumber || 0}</span>;

      case "outputCount":
        // Manager can always edit, Employee can edit when IN_PROGRESS
        if (userRole === "manager") {
          return (
            <EditableInput
              value={getCurrentValue(video, "outputNumber") as number}
              onChange={createOutputNumberHandler(video.id)}
              className="border-blue-200 focus:border-blue-400"
            />
          );
        }

        if (
          (userRole === "employee" || userRole === "special") &&
          video.jobStatus === "IN_PROGRESS"
        ) {
          return (
            <EditableInput
              value={getCurrentValue(video, "outputNumber") as number}
              onChange={createOutputNumberHandler(video.id)}
              className="border-green-200 focus:border-green-400"
            />
          );
        }
        // Other cases: read-only
        return <span>{video.outputNumber || 0}</span>;

      case "filePrice":
        if (userRole === "manager") {
          return (
            <SearchableDropdown
              options={filePriceOptions}
              placeholder="0"
              onChange={createFilePriceChangeHandler(video.id)}
              defaultValue={{ id: 0, name: video.filePrice }}
              className="w-25"
              type="number"
            />
          );
        }
        return <span>{video.filePrice || 0}</span>;

      case "fileCount":
        return <span>{video.fileCount}</span>;

      case "payPerFile":
        const currentPayPerFile = getCurrentValue(
          video,
          "payPerFile"
        ) as number;
        if (userRole === "manager") {
          const displayValue =
            payPerFileInputs[video.id] !== undefined
              ? payPerFileInputs[video.id]
              : formatVNDInput(currentPayPerFile?.toString() || "0");

          return (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                const formatted = formatVNDInput(e.target.value);
                setPayPerFileInputs((prev) => ({
                  ...prev,
                  [video.id]: formatted,
                }));
                const numericValue = parseVNDInput(formatted);
                handleFieldChange(video.id, "payPerFile", numericValue);
              }}
              onBlur={() => {
                // Clean up the display when focus is lost
                const currentValue = getCurrentValue(
                  video,
                  "payPerFile"
                ) as number;
                setPayPerFileInputs((prev) => ({
                  ...prev,
                  [video.id]: formatVNDInput(currentValue?.toString() || "0"),
                }));
              }}
              placeholder="0"
              className="w-[100px] px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:border-blue-400"
            />
          );
        }
        return (
          <span>{formatVNDInput(currentPayPerFile?.toString() || "0")}</span>
        );

      case "totalPayPerFile":
        return (
          <span className="font-medium">
            {formatCurrencyVND(video.totalPayPerFile)}
          </span>
        );

      case "jobStatus":
        // All roles (including Manager) see status as read-only badge
        // Status can only be changed through action buttons
        return (
          <Badge
            variant="outline"
            className={videoStatusColors[video.jobStatus]}
          >
            {videoStatusLabels[video.jobStatus] || video.jobStatus}
          </Badge>
        );

      case "paymentStatus":
        const currentPaymentStatus = getCurrentValue(
          video,
          "paymentStatus"
        ) as string;
        if (userRole === "manager") {
          return (
            <EditableSelect
              value={currentPaymentStatus}
              options={paymentStatusOptions}
              onSave={(value) =>
                handleFieldChange(video.id, "paymentStatus", value)
              }
              className="w-[100%]"
            />
          );
        }
        const paymentLabel =
          paymentStatusOptions.find((opt) => opt.value === currentPaymentStatus)
            ?.label || currentPaymentStatus;
        return <span>{paymentLabel}</span>;

      case "note":
        const currentNote = getCurrentValue(video, "note") as string;
        if (userRole === "manager") {
          return (
            <div
              className="max-w-[400px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded group relative"
              onClick={() =>
                handleOpenEditDialog(video.id, "note", currentNote)
              }
              title="Click để chỉnh sửa"
            >
              <div className="whitespace-pre-wrap break-words line-clamp-3">
                {currentNote ? renderTextWithLinks(currentNote) : "Nhấp để nhập..."}
              </div>
            </div>
          );
        }
        return (
          <div
            className="max-w-[400px] whitespace-pre-wrap break-words line-clamp-3"
            onClick={() => handlePreviewClick(video)}
          >
            {currentNote ? renderTextWithLinks(currentNote) : ""}
          </div>
        );

      case "paymentEmployee":
        if (canEditSpecialFields(video)) {
          const currentPaymentEmployee = getCurrentValue(
            video,
            "paymentEmployee"
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
                  handleFieldChange(video.id, "paymentEmployee", value)
                }
                className="w-[100%]"
              />
            </div>
          );
        }
        return (
          <Badge
            variant="outline"
            className={paymentEmployeeColors[video.paymentEmployee]}
          >
            {
              paymentEmployeeOptions.find(
                (o) => o.value === video.paymentEmployee
              )?.label
            }
          </Badge>
        );

      case "employeeNote":
        const currentEmployeeNote = getCurrentValue(
          video,
          "employeeNote"
        ) as string;
        if (canEditSpecialFields(video)) {
          return (
            <div
              className="max-w-[400px] truncate cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
              onClick={() => {
                setEditVideoId(video.id);
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
        if (employees && employees.length > 0 && userRole === "manager") {
          const currentAssignee = getCurrentValue(video, "assignee") as any;

          return (
            <SearchableDropdown
              options={employees.map((e) => ({
                id: e.id,
                name: e.fullName,
              }))}
              placeholder="Tìm kiếm nhân viên..."
              onChange={createEmployeeChangeHandler(video.id)}
              defaultValue={
                currentAssignee
                  ? {
                      id: currentAssignee.id,
                      name: currentAssignee.fullName,
                    }
                  : video.assignee
                  ? {
                      id: video.assignee.id,
                      name: video.assignee.fullName,
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
            {employees?.find((e) => e.id === video.assignee?.id)?.fullName ||
              video.assignee?.fullName ||
              ""}
          </span>
        );

      case "actions":
        return (
          <div className="flex items-center justify-end gap-2">
            {/* Save button - show for manager OR employee/special with pending changes */}
            {((userRole === "manager" && pendingChangesRef.current[video.id]) ||
              ((userRole === "employee" || userRole === "special") &&
                video.jobStatus === "IN_PROGRESS" &&
                pendingChangesRef.current[video.id]) ||
              (userRole === "special" &&
                canEditSpecialFields(video) &&
                pendingChangesRef.current[video.id])) && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSaveChanges(video.id)}
                  className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-3 w-3" />
                  Lưu
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelChanges(video.id)}
                  className="h-8 gap-1"
                >
                  <X className="h-3 w-3" />
                  Hủy
                </Button>
              </>
            )}

            {/* Action buttons based on status and role */}
            {(userRole === "employee" || userRole === "special") &&
              video.jobStatus === "PENDING" &&
              !pendingChangesRef.current[video.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVideoAction(video.id, "take-video")}
                  className="h-8 gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <PlayCircle className="h-3 w-3" />
                  Nhận
                </Button>
              )}

            {(userRole === "employee" || userRole === "special") &&
              video.jobStatus === "IN_PROGRESS" &&
              !pendingChangesRef.current[video.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVideoAction(video.id, "done-video")}
                  className="h-8 gap-1 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3" />
                  Hoàn Thành
                </Button>
              )}

            {userRole === "manager" &&
              video.jobStatus === "DONE" &&
              !pendingChangesRef.current[video.id] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVideoAction(video.id, "complete-video")}
                  className="h-8 gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle className="h-3 w-3" />
                  Duyệt
                </Button>
              )}

            {/* Delete button - only for manager */}
            {userRole === "manager" && !pendingChangesRef.current[video.id] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(video.id)}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (videos.length === 0) {
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
                    selectedJobIds.size === videos.length && videos.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedJobIds.size > 0 &&
                        selectedJobIds.size < videos.length;
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-12 text-center border-r font-bold">
                STT
              </TableHead>
              {visibleColumns.map((column: string) => (
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
            {videos.map((video, index) => (
              <TableRow
                key={video.id}
                className={
                  userRole === "manager" && selectedJobIds.has(video.id)
                    ? "bg-blue-50 dark:bg-blue-950"
                    : ""
                }
              >
                <TableCell className="w-12 text-center border-r">
                  <input
                    type="checkbox"
                    checked={selectedJobIds.has(video.id)}
                    onChange={() => handleToggleSelect(video.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="w-12 text-center border-r font-medium">
                  {index + 1}
                </TableCell>
                {visibleColumns.map((column: string) => (
                  <TableCell
                    key={`${video.id}-${column}`}
                    className="border-r last:border-r-0"
                  >
                    {renderCell(video, column)}
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
              onClick={handleConfirmBulkDelete}
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
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Đánh Dấu Đã Thanh Toán
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Detail Preview Dialog */}
      <VideoDetailDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        video={previewJob}
      />

      {/* Edit Dialog for CaseName and Note */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editField === "caseName"
                ? "Chỉnh Sửa Tên Công Việc"
                : editField === "employeeNote"
                ? "Chỉnh Sửa Thuê Ngoài"
                : "Chỉnh Sửa Ghi Chú"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editField === "caseName"
                ? "Nhập tên công việc chi tiết của bạn"
                : editField === "employeeNote"
                ? "Nhập thông tin thuê ngoài cho công việc này"
                : "Nhập ghi chú chi tiết cho công việc này"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 flex-1 overflow-hidden flex flex-col gap-4">
            {editField === "caseName" ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Nhập tên công việc..."
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <>
                {/* Preview section with clickable links */}
                {editValue && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Xem trước (click vào link để mở):
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border rounded-md max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words text-sm">
                      {renderTextWithLinks(editValue)}
                    </div>
                  </div>
                )}
                {/* Edit textarea */}
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nội dung:
                  </label>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={
                      editField === "employeeNote"
                        ? "Nhập thông tin thuê ngoài..."
                        : "Nhập ghi chú..."
                    }
                    rows={8}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    autoFocus
                  />
                </div>
              </>
            )}
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
    </>
  );
}
