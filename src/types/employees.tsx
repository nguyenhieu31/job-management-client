export interface EmployeeResponse {
    id: number;
    code: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    chatId?: string;
    isActive: boolean;
    role: RoleDto;
    createdAt: Date;
    isJobAccount: boolean;
    isVideoAccount: boolean;
    bankId: number;
    bankAccountNumber: string;
    bankAccountName: string;
}

export interface EmployeeRequest {
    id?: number | undefined;
    code?: string | undefined;
    email: string;
    password?: string | undefined;
    chatId?: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    isActive: boolean;
    role: string;
    isJobAccount: boolean;
    isVideoAccount: boolean;
    bankId?: number | null;
    bankAccountNumber?: string | null;
    bankAccountName?: string | null;
}

export interface RoleDto {
    id: number;
    name: string;
}

export interface EmployeeFilters {
    search: string;
    roleId?: string;
}

export interface EmployeePagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}