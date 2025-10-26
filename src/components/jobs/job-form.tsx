"use client";

import type React from "react";

import { useEffect, useRef, useReducer, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type {
  JobRequest,
  JobResponse,
  JobStatus,
  PaymentStatus,
} from "@/types/jobs";
import type { WorkRequestResponse } from "@/types/work-requests";
import { EmployeeResponse } from "@/types/employees";
import { CustomerResponse } from "@/types/customers";
import { formatCurrency, formatCurrencyVND } from "@/lib/utils";
import SearchableDropdown from "../ui/search-able-dropdown";
import { filePriceOptions } from "./job-table";

interface JobFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    job:
      | Omit<
          JobRequest,
          "id" | "code" | "date" | "totalPrice" | "outputCount" | "linkDone"
        >
      | JobRequest
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

  // Use refs instead of useState to avoid unnecessary re-renders
  const formRef = useRef({
    caseName: "",
    filePrice: "",
    fileCount: "",
    inputNumber: "",
    outputNumber: "",
    qaOutputNumber: "",
    paymentStatus: "UNPAID" as PaymentStatus,
    jobStatus: "PENDING" as JobStatus,
    inputLink: "",
    doneLink: "",
    note: "",
    assignedEmployee: undefined as string | undefined,
    qualifiedAssignee: undefined as string | undefined,
    customerId: undefined as string | undefined,
    workRequestId: undefined as string | undefined,
    payPerFile: "",
    payPerFileQa: "",
  });

  const isEditingRef = useRef(false);

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
        jobStatus: editingJob.jobStatus,
        inputLink: editingJob.inputLink,
        note: editingJob.note || "",
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
        payPerFile: String(editingJob.payPerFile || ""),
        payPerFileQa: String(editingJob.payPerFileQa || ""),
      };
      isEditingRef.current = true;
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
        jobStatus: "PENDING",
        inputLink: "",
        note: "",
        assignedEmployee: undefined,
        qualifiedAssignee: undefined,
        customerId: undefined,
        workRequestId: undefined,
        payPerFile: "",
        payPerFileQa: "",
      };
      isEditingRef.current = false;
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
      jobStatus,
      inputLink,
      doneLink,
      note,
      qualifiedAssignee,
      workRequestId,
    } = formRef.current;

    const inputCount = parseInt(inputNumber) || 0;
    const price = parseFloat(filePrice) || 0;
    const payPerFileNum = parseFloat(payPerFile) || 0;
    const payPerFileQaNum = parseFloat(payPerFileQa) || 0;
    const fileCountNum = parseInt(fileCount) || 0;
    const outputNum = parseInt(outputNumber) || 0;
    const qaOutputNum = parseInt(qaOutputNumber) || 0;
    const customerId_ = customerId || null;
    const assigneeId_ = assignedEmployee || null;
    const qaId_ = qualifiedAssignee || null;
    const workReqId_ = workRequestId || null;

    if (isEditingRef.current && editingJob) {
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
        jobStatus,
        inputLink: inputLink,
        doneLink: doneLink,
        note: note || null,
        assigneeId: assigneeId_,
        qualifiedAssigneeId: qaId_,
        customerId: customerId_,
        workRequestId: workReqId_,
      } as JobRequest);
    } else {
      // Create: send only required fields, skip id, code, outputNumber, doneLink
      onSubmit({
        caseName,
        inputNumber: inputCount,
        filePrice: price,
        payPerFile: payPerFileNum,
        fileCount: fileCountNum,
        paymentStatus,
        jobStatus,
        inputLink: inputLink,
        note: note || null,
        assigneeId: assigneeId_,
        qualifiedAssigneeId: qaId_,
        customerId: customerId_,
        workRequestId: workReqId_,
      } as Omit<JobRequest, "id" | "code" | "outputNumber" | "doneLink">);
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
      jobStatus: "PENDING",
      inputLink: "",
      qaOutputNumber: "",
      note: "",
      assignedEmployee: undefined,
      qualifiedAssignee: undefined,
      customerId: undefined,
      workRequestId: undefined,
      payPerFile: "",
      payPerFileQa: "",
    };
    onOpenChange(false);
  };

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
                  <Select
                    value={formRef.current.customerId}
                    onValueChange={(v) => (formRef.current.customerId = v)}
                    required
                  >
                    <SelectTrigger id="customerId" className="w-full">
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                    {open && (
                      <SelectContent>
                        {customers.length > 0 ? (
                          customers.map((customer) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id.toString()}
                            >
                              {customer.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="demo-customer">
                            Demo Customer
                          </SelectItem>
                        )}
                      </SelectContent>
                    )}
                  </Select>
                </div>

                {/* Assignee Dropdown */}
                <div className="grid gap-2">
                  <Label htmlFor="assignedEmployee">Nhân viên được giao</Label>
                  <Select
                    value={formRef.current.assignedEmployee}
                    onValueChange={(v) =>
                      (formRef.current.assignedEmployee = v)
                    }
                  >
                    <SelectTrigger id="assignedEmployee" className="w-full">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    {open && (
                      <SelectContent>
                        {employees.length > 0 ? (
                          employees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id.toString()}
                            >
                              {employee.fullName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="demo-employee">
                            Demo Employee
                          </SelectItem>
                        )}
                      </SelectContent>
                    )}
                  </Select>
                </div>
              </div>

              {/* QA Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="qualifiedAssignee">
                  QA (Nhân viên kiểm tra chất lượng)
                </Label>
                <Select
                  value={formRef.current.qualifiedAssignee}
                  onValueChange={(v) => (formRef.current.qualifiedAssignee = v)}
                >
                  <SelectTrigger id="qualifiedAssignee" className="w-full">
                    <SelectValue placeholder="Chọn QA (tùy chọn)" />
                  </SelectTrigger>
                  {open && (
                    <SelectContent>
                      {qaList.length > 0 ? (
                        qaList.map((qa) => (
                          <SelectItem key={qa.id} value={qa.id.toString()}>
                            {qa.fullName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-qa" disabled>
                          Không có QA
                        </SelectItem>
                      )}
                    </SelectContent>
                  )}
                </Select>
              </div>

              {/* Work Request Dropdown */}
              <div className="grid gap-2">
                <Label htmlFor="workRequest">Style hàng</Label>
                <Select
                  value={formRef.current.workRequestId}
                  onValueChange={(v) => (formRef.current.workRequestId = v)}
                >
                  <SelectTrigger id="workRequest" className="w-full">
                    <SelectValue placeholder="Chọn yêu cầu công việc (tùy chọn)" />
                  </SelectTrigger>
                  {open && (
                    <SelectContent>
                      {workRequests.length > 0 ? (
                        workRequests.map((wr) => (
                          <SelectItem key={wr.id} value={String(wr.id)}>
                            {wr.categoryName} - {wr.fileType}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-work-request" disabled>
                          Không có yêu cầu công việc
                        </SelectItem>
                      )}
                    </SelectContent>
                  )}
                </Select>
              </div>

              {/* Input Number and File Price in one row */}
              <div className={`grid ${editingJob ? "grid-cols-3" : "grid-cols-1"} gap-4`}>
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
                  onChange={(e) => (formRef.current.filePrice = e?.name.toString() || "")}
                  defaultValue={{ id: 0, name: formRef.current.filePrice }}
                  type="number"
                />
                {/* <Input
                  id="filePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={formRef.current.filePrice}
                  onChange={(e) => (formRef.current.filePrice = e.target.value)}
                  placeholder="Nhập giá mỗi file"
                /> */}
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
                <Input
                  id="payPerFile"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={formRef.current.payPerFile}
                  onChange={(e) =>
                    (formRef.current.payPerFile = e.target.value)
                  }
                  placeholder="Nhập giá trả nhân viên cho mỗi file"
                />
              </div>

              {/* Pay Per File QA */}
              <div className="grid gap-2">
                <Label htmlFor="payPerFileQa">
                  Giá trả nhân viên/file QA{" "}
                  <span className="text-red-500">(VNĐ)</span>
                </Label>
                <Input
                  id="payPerFileQa"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={formRef.current.payPerFileQa}
                  onChange={(e) =>
                    (formRef.current.payPerFileQa = e.target.value)
                  }
                  placeholder="Nhập giá trả nhân viên cho mỗi file QA"
                />
              </div>

              {/* Total Pay Per File Display */}
              {formRef.current.payPerFile && formRef.current.outputNumber && (
                <div className="grid gap-2">
                  <Label>Tổng tiền trả nhân viên (VNĐ) (Tính toán)</Label>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrencyVND(
                      parseFloat(formRef.current.payPerFile) *
                        parseFloat(formRef.current.outputNumber)
                    )}
                  </div>
                </div>
              )}

              {/* Total Pay Per File QA Display */}
              {formRef.current.payPerFileQa && formRef.current.qaOutputNumber && (
                <div className="grid gap-2">
                  <Label>Tổng tiền trả nhân viên QA (VNĐ) (Tính toán)</Label>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrencyVND(
                      parseFloat(formRef.current.payPerFileQa) *
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
                  >
                    <SelectTrigger id="jobStatus" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái công việc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        Đang tiến hành
                      </SelectItem>
                      <SelectItem value="DONE">Hoàn thành</SelectItem>
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
                    onValueChange={(value) =>
                      (formRef.current.paymentStatus = value as PaymentStatus)
                    }
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
