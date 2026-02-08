export interface CustomerResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    isJobAccount: boolean;
    isVideoAccount: boolean;
}

export interface CustomerRequest {
    id?: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    isJobAccount: boolean;
    isVideoAccount: boolean;
}

export interface CustomerFilters {
    search: string; // Search by name, email, or phone number
}

export interface CustomerPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}