"use client";

import type React from "react";
import { useEffect, useRef, useReducer, memo, useState, useCallback } from "react";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type {
  VideoRequest,
  VideoResponse,
  VideoStatus,
  PaymentStatus,
} from "@/types/videos";
import type { WorkRequestResponse } from "@/types/work-requests";
import { EmployeeResponse } from "@/types/employees";
import { CustomerResponse } from "@/types/customers";
import type { FileStorage } from "@/types/jobs";
import SearchableDropdown from "../ui/search-able-dropdown";
import { filePriceOptions } from "./video-table";

interface VideoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    video:
      | Omit<
          VideoRequest,
          "id" | "code" | "date" | "totalPrice" | "outputCount" | "linkDone"
        >
      | VideoRequest,
    images?: File[],
    videos?: File[],
    imageTempUrls?: string[],
    videoTempUrls?: string[],
  ) => void;
  editingVideo?: VideoResponse | null;
  customers?: CustomerResponse[];
  employees?: EmployeeResponse[];
  qaList?: EmployeeResponse[];
  workRequests?: WorkRequestResponse[];
}

export function VideoForm({
  open,
  onOpenChange,
  onSubmit,
  editingVideo,
  customers = [],
  employees = [],
  workRequests = [],
}: VideoFormProps) {
  // Use useReducer for re-render trigger
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // State for existing fileStorages from server
  const [existingFiles, setExistingFiles] = useState<FileStorage[]>([]);
  // State for files that need to be removed
  const [removedFileStorages, setRemovedFileStorages] = useState<FileStorage[]>(
    [],
  );

  // Use refs instead of useState to avoid unnecessary re-renders
  const formRef = useRef({
    caseName: "",
    filePrice: "",
    fileCount: "",
    inputNumber: "",
    outputNumber: "",
    paymentStatus: "UNPAID" as PaymentStatus,
    paymentEmployee: "UNPAID" as "UNPAID" | "PAID",
    jobStatus: "PENDING" as VideoStatus,
    inputLink: "",
    doneLink: "",
    note: "",
    employeeNote: "",
    assignedEmployee: undefined as string | undefined,
    assignedSale: undefined as string | undefined,
    customerId: undefined as string | undefined,
    workRequestId: undefined as string | undefined,
    payPerFile: "",
    totalPayPerFile: "",
    images: [] as Array<{ file: File; tempUrl: string }>,
    videos: [] as Array<{ file: File; tempUrl: string }>,
  });

  const isEditingRef = useRef(false);

  // Helper function to format number with thousand separators
  const formatVNDInput = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");
    // Add thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper function to parse formatted VND string to number
  const parseVNDInput = (value: string): number => {
    // Remove all dots (thousand separators)
    const numericValue = value.replace(/\./g, "");
    return parseInt(numericValue) || 0;
  };

  // Helper function to extract all media URLs from HTML content
  const extractMediaUrlsFromHtml = useCallback((html: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const urls: string[] = [];

    doc.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
        urls.push(src);
      }
    });

    doc.querySelectorAll("video").forEach((video) => {
      const src = video.getAttribute("src");
      if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
        urls.push(src);
      }
    });

    doc.querySelectorAll("video source").forEach((source) => {
      const src = source.getAttribute("src");
      if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
        urls.push(src);
      }
    });

    return urls;
  }, []);

  // Handler to capture media files from RichTextEditor into formRef
  const handleMediaUpload = useCallback(
    async (file: File, type: "image" | "video"): Promise<string> => {
      const tempUrl = URL.createObjectURL(file);

      if (type === "image") {
        formRef.current.images = [...formRef.current.images, { file, tempUrl }];
      } else {
        formRef.current.videos = [...formRef.current.videos, { file, tempUrl }];
      }

      return tempUrl;
    },
    [],
  );

  useEffect(() => {
    if (editingVideo) {
      formRef.current = {
        caseName: editingVideo.caseName,
        filePrice: String(editingVideo.filePrice),
        inputNumber: String(editingVideo.inputNumber),
        outputNumber: String(editingVideo.outputNumber || ""),
        doneLink: editingVideo.doneLink || "",
        paymentStatus: editingVideo.paymentStatus,
        paymentEmployee: editingVideo.paymentEmployee || "UNPAID",
        jobStatus: editingVideo.jobStatus,
        inputLink: editingVideo.inputLink,
        note: editingVideo.note || "",
        employeeNote: editingVideo.employeeNote || "",
        assignedEmployee: editingVideo.assignee?.id
          ? editingVideo.assignee.id.toString()
          : undefined,
        customerId: editingVideo.customer?.id
          ? editingVideo.customer.id.toString()
          : undefined,
        workRequestId: editingVideo.workRequest?.id
          ? editingVideo.workRequest.id.toString()
          : undefined,
        assignedSale: editingVideo.assignedSale?.id
          ? editingVideo.assignedSale.id.toString()
          : undefined,
        fileCount: String(editingVideo.fileCount),
        // Format pay per file with thousand separators
        payPerFile: editingVideo.payPerFile
          ? formatVNDInput(String(editingVideo.payPerFile))
          : "",
        totalPayPerFile: editingVideo.totalPayPerFile
          ? formatVNDInput(String(editingVideo.totalPayPerFile))
          : "",
        images: [],
        videos: [],
      };
      isEditingRef.current = true;

      // Load existing fileStorages
      if (editingVideo.fileStorages && editingVideo.fileStorages.length > 0) {
        setExistingFiles(editingVideo.fileStorages);
      } else {
        setExistingFiles([]);
      }
      formRef.current.images = [];
      formRef.current.videos = [];
      setRemovedFileStorages([]);
    } else {
      formRef.current = {
        caseName: "",
        filePrice: "",
        fileCount: "",
        inputNumber: "",
        outputNumber: "",
        doneLink: "",
        paymentStatus: "UNPAID",
        paymentEmployee: "UNPAID",
        jobStatus: "PENDING",
        inputLink: "",
        note: "",
        employeeNote: "",
        assignedEmployee: undefined,
        customerId: undefined,
        assignedSale: undefined,
        workRequestId: undefined,
        payPerFile: "",
        totalPayPerFile: "",
        images: [],
        videos: [],
      };
      isEditingRef.current = false;
      setExistingFiles([]);
      setRemovedFileStorages([]);
    }
    // Trigger re-render to update UI
    forceUpdate();
  }, [editingVideo, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      caseName,
      customerId,
      assignedEmployee,
      assignedSale,
      inputNumber,
      filePrice,
      payPerFile,
      totalPayPerFile,
      fileCount,
      outputNumber,
      paymentStatus,
      paymentEmployee,
      jobStatus,
      inputLink,
      doneLink,
      note,
      employeeNote,
      workRequestId,
    } = formRef.current;

    const inputCount = parseInt(inputNumber) || 0;
    const price = parseFloat(filePrice) || 0;
    const payPerFileNum = parseVNDInput(payPerFile);
    const totalPayPerFileNum = parseVNDInput(totalPayPerFile);
    const fileCountNum = parseInt(fileCount) || 0;
    const outputNum = parseInt(outputNumber) || 0;
    const customerId_ = customerId ? parseInt(customerId) : null;
    const assigneeId_ = assignedEmployee ? parseInt(assignedEmployee) : null;
    const assignedSaleId_ = assignedSale ? parseInt(assignedSale) : null;
    const workReqId_ = workRequestId ? parseInt(workRequestId) : null;

    // Filter out media files that were removed from the editor
    const activeImages = formRef.current.images.filter((img) =>
      note.includes(img.tempUrl)
    );
    const activeVideos = formRef.current.videos.filter((vid) =>
      note.includes(vid.tempUrl)
    );

    const imageFiles = activeImages.map((img) => img.file);
    const videoFiles = activeVideos.map((vid) => vid.file);
    const imageTempUrls = activeImages.map((img) => img.tempUrl);
    const videoTempUrls = activeVideos.map((vid) => vid.tempUrl);

    // Detect removed files by comparing HTML with existing fileStorages
    let filesToRemove: FileStorage[] = [];
    if (isEditingRef.current && existingFiles.length > 0) {
      const currentUrls = extractMediaUrlsFromHtml(note);

      filesToRemove = existingFiles.filter((file) => {
        const fileUrl = file.dropboxLink;
        const isStillInHtml = currentUrls.some(
          (url) => url.includes(fileUrl) || fileUrl.includes(url)
        );
        return !isStillInHtml;
      });

      filesToRemove = [...filesToRemove, ...removedFileStorages];
    }

    if (isEditingRef.current && editingVideo) {
      // Check if user cleared assignee or QA fields
      const isDeleteAssignee = editingVideo.assignee?.id && !assignedEmployee;

      // Update: send all fields including id and hidden fields
      onSubmit({
        id: editingVideo.id,
        code: editingVideo.code,
        caseName,
        inputNumber: inputCount,
        filePrice: price,
        payPerFile: payPerFileNum,
        totalPayPerFile: totalPayPerFileNum,
        fileCount: fileCountNum,
        paymentStatus,
        paymentEmployee,
        jobStatus,
        inputLink: inputLink,
        doneLink: doneLink,
        note: note,
        employeeNote: employeeNote,
        assigneeId: assigneeId_,
        customerId: customerId_,
        workRequestId: workReqId_,
        assignedSaleId: assignedSaleId_,
        isDeleteAssignee: isDeleteAssignee,
        fileStoragesNeedRemove:
          filesToRemove.length > 0 ? filesToRemove : undefined,
      } as VideoRequest,
      imageFiles,
      videoFiles,
      imageTempUrls,
      videoTempUrls,
      );
    } else {
      // Create: send only required fields, skip id, code, doneLink
      onSubmit(
        {
          caseName,
          inputNumber: inputCount,
          filePrice: price,
          payPerFile: payPerFileNum,
          totalPayPerFile: totalPayPerFileNum,
          fileCount: fileCountNum,
          paymentStatus,
          paymentEmployee,
          jobStatus,
          inputLink: inputLink,
          note: note || null,
          employeeNote: employeeNote || null,
          assigneeId: assigneeId_,
          customerId: customerId_,
          workRequestId: workReqId_,
          assignedSaleId: assignedSaleId_,
        } as Omit<VideoRequest, "id" | "code" | "doneLink">,
        imageFiles,
        videoFiles,
        imageTempUrls,
        videoTempUrls,
      );
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
      jobStatus: "PENDING",
      inputLink: "",
      note: "",
      employeeNote: "",
      assignedEmployee: undefined,
      customerId: undefined,
      assignedSale: undefined,
      workRequestId: undefined,
      payPerFile: "",
      totalPayPerFile: "",
      images: [],
      videos: [],
    };
    setExistingFiles([]);
    setRemovedFileStorages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? "Cập nhật công việc" : "Thêm công việc mới"}
            </DialogTitle>
            <DialogDescription>
              {editingVideo
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
                    options={customers.map((customer: any) => ({
                      id: customer.id,
                      name: customer.name,
                    }))}
                    placeholder="Tìm kiếm khách hàng..."
                    onChange={(option) => {
                      formRef.current.customerId = option?.id.toString();
                      const selectedCustomer = customers.find((c: any) => c.id === option?.id);
                      formRef.current.assignedSale = selectedCustomer?.sales?.[0]?.id.toString() || undefined;
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
                    options={employees.map((employee: any) => ({
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

              {/* Sale Dropdown - full width */}
              <div className="grid gap-2">
                <Label htmlFor="assignedSale">Saler</Label>
                <SearchableDropdown
                  options={
                    customers
                      .find(
                        (c) =>
                          c.id.toString() === formRef.current.customerId
                      )
                      ?.sales?.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                      })) || []
                  }
                  placeholder="Chọn sale..."
                  onChange={(option) => {
                    formRef.current.assignedSale = option
                      ? option.id.toString()
                      : undefined;
                    forceUpdate();
                  }}
                  defaultValue={
                    formRef.current.assignedSale
                      ? {
                          id: parseInt(formRef.current.assignedSale),
                          name:
                            customers
                              .find(
                                (c) =>
                                  c.id.toString() ===
                                  formRef.current.customerId
                              )
                              ?.sales?.find(
                                (s: any) =>
                                  s.id.toString() ===
                                  formRef.current.assignedSale
                              )?.name || "",
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
                  options={workRequests.map((wr: any) => ({
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
                  editingVideo ? "grid-cols-3" : "grid-cols-1"
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

              {/* Total Pay Per File (editable) */}
              <div className="grid gap-2">
                <Label htmlFor="totalPayPerFile">
                  Tổng tiền trả nhân viên <span className="text-red-500">(VNĐ)</span>
                </Label>
                <Input
                  id="totalPayPerFile"
                  type="text"
                  defaultValue={formRef.current.totalPayPerFile}
                  onChange={(e) => {
                    const formatted = formatVNDInput(e.target.value);
                    formRef.current.totalPayPerFile = formatted;
                    e.target.value = formatted;
                    forceUpdate();
                  }}
                  placeholder="Nhập tổng tiền trả nhân viên (VD: 1.000.000)"
                />
              </div>

              {/* Job Status and Payment Status in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Job Status */}
                <div className="grid gap-2">
                  <Label htmlFor="videoStatus">Trạng thái công việc</Label>
                  <Select
                    value={formRef.current.jobStatus}
                    onValueChange={(value) =>
                      (formRef.current.jobStatus = value as VideoStatus)
                    }
                    disabled={true}
                  >
                    <SelectTrigger id="videoStatus" className="w-full">
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
                      <SelectItem value="NOT_PAYABLE">
                        KHÔNG THANH TOÁN
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Employee */}
                <div className="grid gap-2">
                  <Label htmlFor="paymentEmployee">Thanh toán NV</Label>
                  <Select
                    value={formRef.current.paymentEmployee}
                    onValueChange={(value) => {
                      formRef.current.paymentEmployee = value as "UNPAID" | "PAID";
                      forceUpdate();
                    }}
                  >
                    <SelectTrigger id="paymentEmployee" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái thanh toán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán</SelectItem>
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
              {editingVideo && (
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
                <RichTextEditor
                  value={formRef.current.note}
                  onChange={(html) => (formRef.current.note = html)}
                  placeholder="Nhập ghi chú bổ sung (hỗ trợ định dạng, hình ảnh, video...)"
                  minHeight="120px"
                  onMediaUpload={handleMediaUpload}
                />
              </div>

              {/* Employee Note */}
              {/* <div className="grid gap-2">
                <Label htmlFor="employeeNote">Thuê ngoài</Label>
                <Textarea
                  id="employeeNote"
                  defaultValue={formRef.current.employeeNote}
                  onChange={(e) => (formRef.current.employeeNote = e.target.value)}
                  placeholder="Nhập thông tin thuê ngoài"
                  rows={3}
                />
              </div> */}
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
                {editingVideo ? "Cập nhật công việc" : "Tạo công việc"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default memo(VideoForm);
