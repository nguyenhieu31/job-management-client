"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import type { WorkRequestResponse } from "@/types/work-requests";

interface WorkRequestTableProps {
  workRequests: WorkRequestResponse[];
  onEdit: (workRequest: WorkRequestResponse) => void;
  onDelete: (id: number) => void;
}

export function WorkRequestTable({
  workRequests,
  onEdit,
  onDelete,
}: WorkRequestTableProps) {
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Danh Mục</TableHead>
            <TableHead>Tóm Tắt</TableHead>
            <TableHead>Hướng Dẫn Chi Tiết</TableHead>
            <TableHead>Link Mẫu</TableHead>
            <TableHead>Loại File</TableHead>
            <TableHead>Ghi Chú Màu</TableHead>
            <TableHead className="text-right">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy yêu cầu nào</p>
              </TableCell>
            </TableRow>
          ) : (
            workRequests.map((workRequest) => (
              <TableRow key={workRequest.id}>
                <TableCell className="font-medium">
                  {workRequest.categoryName}
                </TableCell>
                <TableCell>{truncateText(workRequest.summaryNote)}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-sm text-muted-foreground text-ellipsis overflow-hidden">
                    {truncateText(workRequest.detailedNotes, 60)}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={workRequest.linkSample}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span className="text-sm">Xem</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{workRequest.fileType}</Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-sm text-muted-foreground">
                    {truncateText(workRequest.colorNote, 40)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(workRequest)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xóa Yêu Cầu Công Việc
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa{" "}
                            <strong>{workRequest.categoryName}</strong>? Hành động này
                            không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(workRequest.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
