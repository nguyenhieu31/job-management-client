"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployeeRequest, EmployeeResponse, RoleDto } from "@/types/employees";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (employee: Partial<EmployeeRequest>) => void;
  editingEmployee: EmployeeResponse | null;
  roles: RoleDto[];
  onResetPassword?: (employeeId: number) => void;
}

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  editingEmployee,
  roles,
  onResetPassword,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    roleId: "",
    isActive: true,
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        code: editingEmployee.code,
        email: editingEmployee.email,
        fullName: editingEmployee.fullName,
        password: "",
        dateOfBirth: editingEmployee.dateOfBirth
          ? new Date(editingEmployee.dateOfBirth).toISOString().split("T")[0]
          : "",
        phoneNumber: editingEmployee.phoneNumber,
        roleId: editingEmployee.role.id.toString(),
        isActive: editingEmployee.isActive,
      });
    } else {
      setFormData({
        code: "",
        email: "",
        fullName: "",
        password: "",
        dateOfBirth: "",
        phoneNumber: "",
        roleId: "",
        isActive: true,
      });
    }
  }, [editingEmployee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRole = roles.find((r) => r.id.toString() === formData.roleId);
    if (!selectedRole) return;

    const employee: Partial<EmployeeRequest> = {
      ...(editingEmployee && { id: editingEmployee.id }),
      code: formData.code,
      email: formData.email,
      fullName: formData.fullName,
      dateOfBirth: new Date(formData.dateOfBirth),
      phoneNumber: formData.phoneNumber,
      role: selectedRole.name,
      isActive: formData.isActive,
    };

    onSubmit(employee);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? "Chỉnh Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}
          </DialogTitle>
          <DialogDescription>
            {editingEmployee
              ? "Cập nhật thông tin nhân viên"
              : "Điền thông tin để tạo nhân viên mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          {editingEmployee && (
            <div className="space-y-2">
              <Label htmlFor="code">Mã Nhân Viên</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ví dụ: EMP-001"
                disabled
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="nhanvien@example.com"
              required
            />
          </div>
          {}
          <div className="space-y-2">
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                {editingEmployee && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onResetPassword?.(editingEmployee.id)}
                    className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                )}
              </div>
              <Input
                id="password"
                type={showNewPassword ? "text" : "password"}
                placeholder={editingEmployee ? "********" : "Nhập mật khẩu"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={!!editingEmployee}
                required={!editingEmployee}
              />
              {!editingEmployee && (
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ Tên <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày Sinh</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số Điện Thoại</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="+84 123 456 789"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Vai Trò</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) =>
                setFormData({ ...formData, roleId: value })
              }
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Hoạt Động
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingEmployee ? "Cập Nhật" : "Tạo Mới"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
