export interface WorkRequestResponse {
    id: number;
    categoryName: string;
    summaryNote: string;
    detailedNotes: string;
    linkSample: string;
    fileType: string;
    colorNote: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WorkRequestRequest {
    id?: number | null;
    categoryName: string;
    summaryNote: string;
    detailedNotes: string;
    linkSample: string;
    fileType: string;
    colorNote: string;
}

export interface WorkRequestFilters {
    search: string; // Search by category name or file type
}

export interface WorkRequestPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
