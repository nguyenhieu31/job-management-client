"use client";

import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, RotateCcw } from "lucide-react";
import type { CustomerAccountResponse } from "@/types/customer-accounts";

interface CustomerAccountTableProps {
    customerAccounts: CustomerAccountResponse[];
    onEdit: (account: CustomerAccountResponse) => void;
    onDelete: (id: number) => void;
    onResetPassword: (id: number) => void;
    currentPage: number;
    pageSize: number;
}

export function CustomerAccountTable({
    customerAccounts, onEdit, onDelete, onResetPassword, currentPage, pageSize,
}: CustomerAccountTableProps) {

    return (
        <div className="bg-card rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Tên người dùng</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mã</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customerAccounts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                <p className="text-muted-foreground">Không tìm thấy tài khoản khách hàng</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        customerAccounts.map((account, index) => (
                            <TableRow key={account.id} className="cursor-pointer" onClick={() => onEdit(account)}>
                                <TableCell className="text-muted-foreground">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </TableCell>
                                <TableCell className="font-medium">{account.userName || "—"}</TableCell>
                                <TableCell>{account.email}</TableCell>
                                <TableCell>{account.code}</TableCell>
                                <TableCell>
                                    <Badge variant={account.isActive ? "default" : "secondary"}
                                        className={account.isActive
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"}>
                                        {account.isActive ? "Hoạt động" : "Ngưng hoạt động"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onResetPassword(account.id); }}
                                            title="Đặt lại mật khẩu">
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onEdit(account); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xóa tài khoản khách hàng</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bạn có chắc chắn muốn xóa <strong>{account.userName || account.email}</strong>?
                                                        Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(account.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
