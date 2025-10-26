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
import { Pencil, Trash2 } from "lucide-react";
import type { EmployeeResponse } from "@/types/employees";

interface EmployeeTableProps {
  employees: EmployeeResponse[];
  onEdit: (employee: EmployeeResponse) => void;
  onDelete: (id: number) => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã NV</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Họ Tên</TableHead>
            <TableHead>Ngày Sinh</TableHead>
            <TableHead>Số Điện Thoại</TableHead>
            <TableHead>Chat ID</TableHead>
            <TableHead>Vai Trò</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead className="text-right">Hành Động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <p className="text-muted-foreground">Không tìm thấy nhân viên</p>
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.code}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.fullName}</TableCell>
                <TableCell>{formatDate(employee.dateOfBirth)}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>{employee.chatId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{employee.role.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={employee.isActive ? "default" : "secondary"}
                    className={
                      employee.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }
                  >
                    {employee.isActive ? "Hoạt Động" : "Ngừng Hoạt Động"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(employee)}
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
                            Xóa Nhân Viên
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa{" "}
                            <strong>{employee.fullName}</strong>? Hành động này
                            không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(employee.id)}
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
