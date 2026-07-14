export interface SaleInfo {
    id: number;
    name: string;
    code?: string;
}

export interface CustomerResponse {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    customerCode?: string;
    primarySaleId?: number;
    primarySaleName?: string;
    sales?: SaleInfo[];
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
    saleIds?: number[];
    primarySaleId?: number;
    isJobAccount: boolean;
    isVideoAccount: boolean;
}

export interface CustomerFilters {
    search: string;
    saleId?: number;
}

export interface CustomerPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
