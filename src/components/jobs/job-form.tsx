"use client";

import type React from "react";

import { useEffect, useRef, useReducer, memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type {
  JobRequest,
  JobResponse,
  JobStatus,
  PaymentStatus,
  EmployeePaymentStatus,
  FileStorage,
} from "@/types/jobs";
import type { WorkRequestResponse } from "@/types/work-requests";
import { EmployeeResponse } from "@/types/employees";
import { CustomerResponse } from "@/types/customers";
import { formatCurrency, formatCurrencyVND } from "@/lib/utils";
import SearchableDropdown from "../ui/search-able-dropdown";
import { filePriceOptions, filePriceEmployeeOptions, filePriceQaOptions } from "./job-table";

interface JobFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    job:
      | Omit<
          JobRequest,
          "id" | "code" | "date" | "totalPrice" | "outputCount" | "linkDone"
        >
      | JobRequest,
    images?: File[],
    videos?: File[]
  ) => void;
  editingJob?: JobResponse | null;
  customers?: CustomerResponse[];
  employees?: EmployeeResponse[];
  qaList?: EmployeeResponse[];
  workRequests?: WorkRequestResponse[];
}

export function JobForm({
  open,
  onOpenChange,
  onSubmit,
  editingJob,
  customers = [],
  employees = [],
  qaList = [],
  workRequests = [],
}: JobFormProps) {
  // Use useReducer for re-render trigger
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // State for existing fileStorages from server
  const [existingFiles, setExistingFiles] = useState<FileStorage[]>([]);
  // State for files that need to be removed
  const [removedFileStorages, setRemovedFileStorages] = useState<FileStorage[]>([]);

  // Use refs instead of useState to avoid unnecessary re-renders
  const formRef = useRef({
    caseName: "",
    filePrice: "",
    fileCount: "",
    inputNumber: "",
    outputNumber: "",
    qaOutputNumber: "",
    paymentStatus: "UNPAID" as PaymentStatus,
    paymentEmployee: "UNPAID" as EmployeePaymentStatus,
    paymentEmployeeQa: "UNPAID" as EmployeePaymentStatus,
    jobStatus: "PENDING" as JobStatus,
    inputLink: "",
    doneLink: "",
    note: "",
    employeeNote: "",
    assignedEmployee: undefined as string | undefined,
    qualifiedAssignee: undefined as string | undefined,
    customerId: undefined as string | undefined,
    workRequestId: undefined as string | undefined,
    payPerFile: "",
    payPerFileQa: "",
    deadline: "",
  });

  const isEditingRef = useRef(false);

  // Helper function to format number with VND thousand separators (dots)
  const formatVND = (value: string | number): string => {
    const numericValue = value.toString().replace(/\D/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper function to parse VND formatted string to number
  const parseVND = (value: string): number => {
    const numericValue = value.replace(/\./g, "");
    return parseInt(numericValue) || 0;
  };

  useEffect(() => {
    if (editingJob) {
      formRef.current = {
        caseName: editingJob.caseName,
        filePrice: String(editingJob.filePrice),
        inputNumber: String(editingJob.inputNumber),
        outputNumber: String(editingJob.outputNumber || ""),
        qaOutputNumber: String(editingJob.qaOutputNumber || ""),
        doneLink: editingJob.doneLink || "",
        paymentStatus: editingJob.paymentStatus,
        paymentEmployee: editingJob.paymentEmployee,
        paymentEmployeeQa: editingJob.paymentEmployeeQa,
        jobStatus: editingJob.jobStatus,
        inputLink: editingJob.inputLink,
        note: editingJob.note || "",
        employeeNote: editingJob.employeeNote || "",
        assignedEmployee: editingJob.assignee?.id
          ? editingJob.assignee.id.toString()
          : undefined,
        qualifiedAssignee: editingJob.qualifiedAssignee?.id
          ? editingJob.qualifiedAssignee.id.toString()
          : undefined,
        customerId: editingJob.customer?.id
          ? editingJob.customer.id.toString()
          : undefined,
        workRequestId: editingJob.workRequest?.id
          ? editingJob.workRequest.id.toString()
          : undefined,
        fileCount: String(editingJob.fileCount),
        // Store pay per file with VND formatting (dots as thousand separators)
        payPerFile: editingJob.payPerFile
          ? formatVND(String(editingJob.payPerFile))
          : "",
        payPerFileQa: editingJob.payPerFileQa
          ? formatVND(String(editingJob.payPerFileQa))
          : "",
        deadline: editingJob.deadline
          ? (() => {
              // Check if deadline is already in HH:mm format
              const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
              if (timeRegex.test(editingJob.deadline)) {
                return editingJob.deadline;
              }
              // Try to parse as Date
              const date = new Date(editingJob.deadline);
              if (!isNaN(date.getTime())) {
                return date.toTimeString().slice(0, 5);
              }
              // If contains time part in string (e.g., "2025-11-07 22:08:32")
              const timeMatch = editingJob.deadline.match(/(\d{2}):(\d{2})/);
              if (timeMatch) {
                return `${timeMatch[1]}:${timeMatch[2]}`;
              }
              return "";
            })()
          : "",
      };
      isEditingRef.current = true;

      // Load existing fileStorages
      if (editingJob.fileStorages && editingJob.fileStorages.length > 0) {
        setExistingFiles(editingJob.fileStorages);
      } else {
        setExistingFiles([]);
      }
      setUploadedFiles([]);
      setRemovedFileStorages([]);
    } else {
      formRef.current = {
        caseName: "",
        filePrice: "",
        fileCount: "",
        inputNumber: "",
        outputNumber: "",
        qaOutputNumber: "",
        doneLink: "",
        paymentStatus: "UNPAID",
        paymentEmployee: "UNPAID",
        paymentEmployeeQa: "UNPAID",
        jobStatus: "PENDING",
        inputLink: "",
        note: "",
        employeeNote: "",
        assignedEmployee: undefined,
        qualifiedAssignee: undefined,
        customerId: undefined,
        workRequestId: undefined,
        payPerFile: "",
        payPerFileQa: "",
        deadline: "",
      };
      isEditingRef.current = false;
      setUploadedFiles([]);
      setExistingFiles([]);
      setRemovedFileStorages([]);
    }
    // Trigger re-render to update UI
    forceUpdate();
  }, [editingJob, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      caseName,
      customerId,
      assignedEmployee,
      inputNumber,
      filePrice,
      payPerFile,
      payPerFileQa,
      fileCount,
      outputNumber,
      qaOutputNumber,
      paymentStatus,
      paymentEmployee,
      paymentEmployeeQa,
      jobStatus,
      inputLink,
      doneLink,
      note,
      employeeNote,
      qualifiedAssignee,
      workRequestId,
      deadline,
    } = formRef.current;

    const inputCount = parseInt(inputNumber) || 0;
    const price = parseFloat(filePrice) || 0;
    // Parse VND formatted strings back to numbers (remove dots)
    const payPerFileNum = parseVND(payPerFile);
    const payPerFileQaNum = parseVND(payPerFileQa);
    const fileCountNum = parseInt(fileCount) || 0;
    const outputNum = parseInt(outputNumber) || 0;
    const qaOutputNum = parseInt(qaOutputNumber) || 0;
    const customerId_ = customerId || null;
    const assigneeId_ = assignedEmployee || null;
    const qaId_ = qualifiedAssignee || null;
    const workReqId_ = workRequestId || null;

    // Separate uploaded files into images and videos (only new files with File object)
    const imageFiles = uploadedFiles
      .filter((f) => f.file && f.type === "image")
      .map((f) => f.file as File);
    const videoFiles = uploadedFiles
      .filter((f) => f.file && f.type === "video")
      .map((f) => f.file as File);

    if (isEditingRef.current && editingJob) {
      // Check if user cleared assignee or QA fields
      const isDeleteAssignee = editingJob.assignee?.id && !assignedEmployee;
      const isDeleteQualifiedAssignee =
        editingJob.qualifiedAssignee?.id && !qualifiedAssignee;

      // Update: send all fields including id and hidden fields
      onSubmit({
        id: editingJob.id,
        code: editingJob.code,
        caseName,
        inputNumber: inputCount,
        outputNumber: outputNum,
        qaOutputNumber: qaOutputNum,
        filePrice: price,
        payPerFile: payPerFileNum,
        payPerFileQa: payPerFileQaNum,
        fileCount: fileCountNum,
        paymentStatus,
        paymentEmployee,
        paymentEmployeeQa,
        jobStatus,
        inputLink: inputLink,
        doneLink: doneLink,
        note: note,
        employeeNote: employeeNote || null,
        assigneeId: assigneeId_,
        qualifiedAssigneeId: qaId_,
        customerId: customerId_,
        workRequestId: workReqId_,
        deadline: deadline || null,
        isDeleteAssignee: isDeleteAssignee,
        isDeleteQualifiedAssignee: isDeleteQualifiedAssignee,
        fileStoragesNeedRemove: removedFileStorages.length > 0 ? removedFileStorages : undefined,
      } as JobRequest, imageFiles, videoFiles);
    } else {
      // Create: send only required fields, skip id, code, outputNumber, doneLink
      onSubmit({
        caseName,
        inputNumber: inputCount,
        filePrice: price,
        payPerFile: payPerFileNum,
        fileCount: fileCountNum,
        paymentStatus,
        paymentEmployee,
        jobStatus,
        inputLink: inputLink,
        note: note || null,
        employeeNote: employeeNote || null,
        assigneeId: assigneeId_,
        qualifiedAssigneeId: qaId_,
        customerId: customerId_,
        workRequestId: workReqId_,
        deadline: deadline || null,
      } as Omit<JobRequest, "id" | "code" | "outputNumber" | "doneLink">, imageFiles, videoFiles);
    }

    // Reset form
    formRef.current = {
      caseName: "",
      filePrice: "",
      fileCount: "",
      inputNumber: "",
      outputNumber: "",
      doneLink: "",
      paymentStatus: "UNPAID",
      paymentEmployee: "UNPAID",
      paymentEmployeeQa: "UNPAID",
      jobStatus: "PENDING",
      inputLink: "",
      qaOutputNumber: "",
      note: "",
      employeeNote: "",
      assignedEmployee: undefined,
      qualifiedAssignee: undefined,
      customerId: undefined,
      workRequestId: undefined,
      payPerFile: "",
      payPerFileQa: "",
      deadline: "",
    };
    setUploadedFiles([]);
    setExistingFiles([]);
    setRemovedFileStorages([]);
    onOpenChange(false);
  };

  console.log("removedFileStorages: ", removedFileStorages)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Cập nhật công việc" : "Thêm công việc mới"}
            </DialogTitle>
            <DialogDescription>
              {editingJob
                ? "Cập nhật thông tin công việc bên dưới."
                : "Điền thông tin để tạo công việc mới."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Case Name */}
              <div className="grid gap-2">
                <Label htmlFor="caseName">Tên Job</Label>
                <Input
                  id="caseName"
                  defaultValue={formRef.current.caseName}
                  onChange={(e) => (formRef.current.caseName = e.target.value)}
                  placeholder="Nhập tên trường hợp"
                />
              </div>

              {/* Customer and Assignee in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="customerId">
                    Khách hàng <span className="text-red-500">*</span>
                  </Label>
                  <SearchableDropdown
                    options={customers.map((customer) => ({
                      id: customer.id,
                      name: customer.name,
                    }))}
                    placeholder="Tìm kiếm khách hàng..."
                    onChange={(option) => {
                      formRef.current.customerId = option?.id.toString();
                      forceUpdate();
                    }}
                    defaultValue={
                      formRef.current.customerId
                        ? {
                            id: parseInt(formRef.current.customerId),
                            name:
                              customers.find(
                                (c) =>
                                  c.id.toString() === formRef.current.customerId
                              )?.name || "",
                          }
                        : null
                    }
                    type="text"
                  />
                </div>

                {/* Assignee Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="assignedEmployee">Nhân viên được giao</Label>
                  <SearchableDropdown
                    options={employees.map((employee) => ({
                      id: employee.id,
                      name: employee.fullName,
                    }))}
                    placeholder="Tìm kiếm nhân viên..."
                    onChange={(option) => {
                      formRef.current.assignedEmployee = option
                        ? option.id.toString()
                        : undefined;
                      forceUpdate();
                    }}
                    defaultValue={
                      formRef.current.assignedEmployee
                        ? {
                            id: parseInt(formRef.current.assignedEmployee),
                            name:
                              employees.find(
                                (e) =>
                                  e.id.toString() ===
                                  formRef.current.assignedEmployee
                              )?.fullName || "",
                          }
                        : null
                    }
                    type="text"
                  />
                </div>
              </div>

              {/* QA Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="qualifiedAssignee">
                  QA (Nhân viên kiểm tra chất lượng)
                </Label>
                <SearchableDropdown
                  options={qaList.map((qa) => ({
                    id: qa.id,
                    name: qa.fullName,
                  }))}
                  placeholder="Tìm kiếm QA..."
                  onChange={(option) => {
                    formRef.current.qualifiedAssignee = option
                      ? option.id.toString()
                      : undefined;
                    forceUpdate();
                  }}
                  defaultValue={
                    formRef.current.qualifiedAssignee
                      ? {
                          id: parseInt(formRef.current.qualifiedAssignee),
                          name:
                            qaList.find(
                              (q) =>
                                q.id.toString() ===
                                formRef.current.qualifiedAssignee
                            )?.fullName || "",
                        }
                      : null
                  }
                  type="text"
                />
              </div>

              {/* Work Request Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="workRequest">Style hàng</Label>
                <SearchableDropdown
                  options={workRequests.map((wr) => ({
                    id: wr.id,
                    name: `${wr.categoryName} - ${wr.fileType}`,
                  }))}
                  placeholder="Tìm kiếm style hàng..."
                  onChange={(option) => {
                    formRef.current.workRequestId = option?.id.toString();
                    forceUpdate();
                  }}
                  defaultValue={
                    formRef.current.workRequestId
                      ? {
                          id: parseInt(formRef.current.workRequestId),
                          name: workRequests.find(
                            (wr) =>
                              wr.id.toString() === formRef.current.workRequestId
                          )
                            ? `${
                                workRequests.find(
                                  (wr) =>
                                    wr.id.toString() ===
                                    formRef.current.workRequestId
                                )?.categoryName
                              } - ${
                                workRequests.find(
                                  (wr) =>
                                    wr.id.toString() ===
                                    formRef.current.workRequestId
                                )?.fileType
                              }`
                            : "",
                        }
                      : null
                  }
                  type="text"
                />
              </div>

              {/* Input Number and File Price in one row */}
              <div
                className={`grid ${
                  editingJob ? "grid-cols-3" : "grid-cols-1"
                } gap-4`}
              >
                {/* Input Number */}
                <div className="grid gap-2">
                  <Label htmlFor="inputNumber">Số lượng input</Label>
                  <Input
                    id="inputNumber"
                    type="number"
                    min="0"
                    defaultValue={formRef.current.inputNumber}
                    onChange={(e) =>
                      (formRef.current.inputNumber = e.target.value)
                    }
                    placeholder="Nhập số lượng input"
                  />
                </div>
                {/* Output Number - Only show when editing */}
                {editingJob && (
                  <div className="grid gap-2">
                    <Label htmlFor="outputNumber">Số lượng output</Label>
                    <Input
                      id="outputNumber"
                      type="number"
                      min="0"
                      defaultValue={formRef.current.outputNumber}
                      onChange={(e) =>
                        (formRef.current.outputNumber = e.target.value)
                      }
                      placeholder="Nhập số lượng output"
                    />
                  </div>
                )}
                {editingJob && (
                  <div className="grid gap-2">
                    <Label htmlFor="outputNumber">Số lượng output QA</Label>
                    <Input
                      id="outputNumber"
                      type="number"
                      min="0"
                      defaultValue={formRef.current.qaOutputNumber}
                      onChange={(e) =>
                        (formRef.current.qaOutputNumber = e.target.value)
                      }
                      placeholder="Nhập số lượng output QA"
                    />
                  </div>
                )}
              </div>

              {/* File Price */}
              <div className="grid gap-2">
                <Label htmlFor="filePrice">
                  Giá mỗi file <span className="text-red-500">($)</span>
                </Label>
                <SearchableDropdown
                  options={filePriceOptions}
                  placeholder="Nhập giá mỗi file"
                  onChange={(e) =>
                    (formRef.current.filePrice = e?.name.toString() || "")
                  }
                  defaultValue={{ id: 0, name: formRef.current.filePrice }}
                  type="number"
                />
              </div>

              {/* Total Price Display */}
              {formRef.current.outputNumber && formRef.current.filePrice && (
                <div className="grid gap-2">
                  <Label>Tổng giá (Tính toán)</Label>
                  <div className="text-lg font-semibold text-primary">
                    {formatCurrency(
                      parseFloat(formRef.current.outputNumber) *
                        parseFloat(formRef.current.filePrice) || 0
                    )}
                  </div>
                </div>
              )}

              {/* Pay Per File */}
              <div className="grid gap-2">
                <Label htmlFor="payPerFile">
                  Giá trả nhân viên/file{" "}
                  <span className="text-red-500">(VNĐ)</span>
                </Label>
                <SearchableDropdown
                  options={filePriceEmployeeOptions.map(option => ({
                    id: option.id,
                    name: formatVND(option.name.toString())
                  }))}
                  placeholder="Nhập giá trả nhân viên cho mỗi file"
                  onChange={(e) =>
                    (formRef.current.payPerFile = e?.name.toString() || "")
                  }
                  defaultValue={{ id: 0, name: formRef.current.payPerFile }}
                  type="vnd"
                />
              </div>

              {/* Pay Per File QA */}
              <div className="grid gap-2">
                <Label htmlFor="payPerFileQa">
                  Giá trả nhân viên/file QA{" "}
                  <span className="text-red-500">(VNĐ)</span>
                </Label>
                <SearchableDropdown
                  options={filePriceQaOptions.map(option => ({
                    id: option.id,
                    name: formatVND(option.name.toString())
                  }))}
                  placeholder="Nhập giá trả nhân viên cho mỗi file QA"
                  onChange={(e) =>
                    (formRef.current.payPerFileQa = e?.name.toString() || "")
                  }
                  defaultValue={{ id: 0, name: formRef.current.payPerFileQa }}
                  type="vnd"
                />
              </div>

              {/* Total Pay Per File Display */}
              {formRef.current.payPerFile && formRef.current.outputNumber && (
                <div className="grid gap-2">
                  <Label>Tổng tiền trả nhân viên (VNĐ) (Tính toán)</Label>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrencyVND(
                      parseVND(formRef.current.payPerFile) *
                        parseFloat(formRef.current.outputNumber)
                    )}
                  </div>
                </div>
              )}

              {/* Total Pay Per File QA Display */}
              {formRef.current.payPerFileQa &&
                formRef.current.qaOutputNumber && (
                  <div className="grid gap-2">
                    <Label>Tổng tiền trả nhân viên QA (VNĐ) (Tính toán)</Label>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrencyVND(
                        parseVND(formRef.current.payPerFileQa) *
                          parseFloat(formRef.current.qaOutputNumber)
                      )}
                    </div>
                  </div>
                )}

              {/* Job Status and Payment Status in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Job Status */}
                <div className="grid gap-2">
                  <Label htmlFor="jobStatus">Trạng thái công việc</Label>
                  <Select
                    value={formRef.current.jobStatus}
                    onValueChange={(value) =>
                      (formRef.current.jobStatus = value as JobStatus)
                    }
                    disabled={true}
                  >
                    <SelectTrigger id="jobStatus" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái công việc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        Đang tiến hành
                      </SelectItem>
                      <SelectItem value="DONE">Đợi xét duyệt</SelectItem>
                      <SelectItem value="IN_REVIEW">Đang xem xét</SelectItem>
                      <SelectItem value="REVIEWED">Đã xem xét</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status */}
                <div className="grid gap-2">
                  <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
                  <Select
                    value={formRef.current.paymentStatus}
                    onValueChange={(value) => {
                      formRef.current.paymentStatus = value as PaymentStatus;
                      forceUpdate(); // Trigger re-render để cập nhật UI
                    }}
                  >
                    <SelectTrigger id="paymentStatus" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                      <SelectItem value="INVOICE_DRAFT">
                        Đã tạo hóa đơn
                      </SelectItem>
                      <SelectItem value="INVOICE_SENT">
                        Đã gửi hóa đơn
                      </SelectItem>
                      <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Employee Status */}
              {editingJob && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paymentEmployee">
                      Thanh toán nhân viên
                    </Label>
                    <Select
                      value={formRef.current.paymentEmployee}
                      onValueChange={(value) => {
                        formRef.current.paymentEmployee =
                          value as EmployeePaymentStatus;
                        forceUpdate(); // Trigger re-render để cập nhật UI
                      }}
                    >
                      <SelectTrigger id="paymentEmployee" className="w-full">
                        <SelectValue placeholder="Chọn trạng thái thanh toán nhân viên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paymentEmployee">
                      Thanh toán nhân viên QA
                    </Label>
                    <Select
                      value={formRef.current.paymentEmployeeQa}
                      onValueChange={(value) => {
                        formRef.current.paymentEmployeeQa =
                          value as EmployeePaymentStatus;
                        forceUpdate(); // Trigger re-render để cập nhật UI
                      }}
                    >
                      <SelectTrigger id="paymentEmployeeQa" className="w-full">
                        <SelectValue placeholder="Chọn trạng thái thanh toán nhân viên QA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* Input Link */}
              <div className="grid gap-2">
                <Label htmlFor="inputLink">Input Link</Label>
                <Input
                  id="inputLink"
                  type="url"
                  defaultValue={formRef.current.inputLink}
                  onChange={(e) => (formRef.current.inputLink = e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              {/* Deadline - Giờ hoàn thành */}
              <div className="grid gap-2">
                <Label htmlFor="deadline">Giờ hoàn thành</Label>
                <Input
                  id="deadline"
                  type="time"
                  defaultValue={formRef.current.deadline}
                  onChange={(e) => (formRef.current.deadline = e.target.value)}
                />
              </div>

              {/* Done Link - Only show when editing */}
              {editingJob && (
                <div className="grid gap-2">
                  <Label htmlFor="doneLink">Link hoàn thành</Label>
                  <Input
                    id="doneLink"
                    type="url"
                    defaultValue={formRef.current.doneLink}
                    onChange={(e) =>
                      (formRef.current.doneLink = e.target.value)
                    }
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              )}

              {/* Existing Files Display - Only show when editing and has existing files */}
              {editingJob && existingFiles.length > 0 && (
                <div className="grid gap-2">
                  <Label>Ảnh & Video đã tải lên</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {existingFiles.map((file) => (
                      <div key={file.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {file.isImage ? (
                            <img
                              src={file.dropboxLink}
                              alt="Uploaded"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <video
                                src={file.dropboxLink}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs px-2">
                                VIDEO
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRemovedFileStorages([...removedFileStorages, file]);
                            setExistingFiles(existingFiles.filter(f => f.id !== file.id));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload - Images & Videos */}
              <div className="grid gap-2">
                <Label>Thêm ảnh & video mới</Label>
                <FileUpload
                  value={uploadedFiles}
                  onChange={(files) => setUploadedFiles(files)}
                  maxFiles={20}
                  maxSizeMB={50}
                />
              </div>

              {/* Note */}
              <div className="grid gap-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  defaultValue={formRef.current.note}
                  onChange={(e) => (formRef.current.note = e.target.value)}
                  placeholder="Nhập ghi chú bổ sung"
                  rows={3}
                />
              </div>

              {/* Employee Note */}
              {/* {editingJob && (
                <div className="grid gap-2">
                  <Label htmlFor="employeeNote">Thuê ngoài</Label>
                  <Textarea
                    id="employeeNote"
                    defaultValue={formRef.current.employeeNote}
                    onChange={(e) => (formRef.current.employeeNote = e.target.value)}
                    placeholder="Nhập thuê ngoài"
                    rows={3}
                  />
                </div>
              )} */}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {editingJob ? "Cập nhật công việc" : "Tạo công việc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default memo(JobForm);
