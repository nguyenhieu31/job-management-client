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
}

export interface RoleDto {
    id: number;
    name: string;
}

export interface EmployeeFilters {
    search: string; // Search by name, email, or phone number
}

export interface EmployeePagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}