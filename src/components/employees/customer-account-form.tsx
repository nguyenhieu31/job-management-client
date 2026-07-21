"use client";

import { useState, useEffect } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";
import type { CustomerAccountRequest, CustomerAccountResponse } from "@/types/customer-accounts";

interface CustomerAccountFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (account: Partial<CustomerAccountRequest>) => void;
    editingAccount: CustomerAccountResponse | null;
    onResetPassword?: (id: number) => void;
}

interface CustomerAccountFormData {
    userName: string;
    fullName: string;
    email: string;
    password: string;
    isActive: boolean;
}

export function CustomerAccountForm({
    open, onOpenChange, onSubmit, editingAccount, onResetPassword,
}: CustomerAccountFormProps) {
    const [formData, setFormData] = useState<CustomerAccountFormData>({
        userName: "", fullName: "", email: "", password: "", isActive: true,
    });

    useEffect(() => {
        if (editingAccount) {
            setFormData({
                userName: editingAccount.userName || "",
                fullName: editingAccount.fullName || "",
                email: editingAccount.email,
                password: "",
                isActive: editingAccount.isActive,
            });
        } else {
            setFormData({ userName: "", fullName: "", email: "", password: "", isActive: true });
        }
    }, [editingAccount, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Partial<CustomerAccountRequest> = {
            ...(editingAccount && { id: editingAccount.id }),
            userName: formData.userName || undefined,
            fullName: formData.fullName || undefined,
            email: formData.email,
            isActive: formData.isActive,
        };
        if (!editingAccount) {
            payload.password = formData.password;
        }
        onSubmit(payload);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingAccount ? "Chỉnh Sửa Tài Khoản Khách Hàng" : "Thêm Tài Khoản Khách Hàng Mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {editingAccount
                            ? "Cập nhật thông tin tài khoản khách hàng"
                            : "Điền thông tin để tạo tài khoản khách hàng mới"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingAccount && (
                        <div className="space-y-2">
                            <Label htmlFor="code">Mã tài khoản</Label>
                            <Input id="code" value={editingAccount.code} disabled />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="userName">Tên người dùng <span className="text-red-500">(dùng để đăng nhập)</span></Label>
                        <Input id="userName" type="text" value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                            placeholder="Nhập tên người dùng" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input id="fullName" type="text" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Nhập họ và tên" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input id="email" type="email" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="customer@example.com" required />
                    </div>

                    {!editingAccount ? (
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                            <Input id="password" type="password" value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Nhập mật khẩu" required />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Mật khẩu</Label>
                                <Button type="button" variant="ghost" size="sm"
                                    onClick={() => onResetPassword?.(editingAccount.id)}
                                    className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <RotateCcw className="w-4 h-4" /> Đặt lại mật khẩu
                                </Button>
                            </div>
                            <Input type="password" value="********" disabled />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isActive" checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300" />
                        <Label htmlFor="isActive" className="cursor-pointer">Hoạt động</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {editingAccount ? "Cập Nhật" : "Tạo Mới"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Hủy
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
