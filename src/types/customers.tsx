export interface CustomerResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    customerCode?: string;
    assignedSaleId?: number;
    assignedSaleName?: string;
    isJobAccount: boolean;
    isVideoAccount: boolean;
}

export interface CustomerRequest {
    id?: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    customerCode?: string;
    assignedSaleId?: number;
    isJobAccount: boolean;
    isVideoAccount: boolean;
}

export interface CustomerFilters {
    search: string;
    assignedSaleId?: number;
}

export interface CustomerPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
