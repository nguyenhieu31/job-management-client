export interface PageRequest {
    pageNumber: number;
    pageSize: number;
}

export interface PageResponse<T> {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    data: T;
}