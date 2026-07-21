export interface CustomerAccountResponse {
    id: number;
    code: string;
    userName: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    isActive: boolean;
    role: { id: number; name: string };
    createdAt: string;
}

export interface CustomerAccountRequest {
    id?: number;
    userName?: string;
    email: string;
    password?: string;
    isActive?: boolean;
}

export interface CustomerAccountFilters {
    search: string;
}

export interface CustomerAccountPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
