export type OrderStatus =
  | "PENDING"
  | "REVIEWED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface OrderAttachment {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw" | string;
  originalName?: string;
  contentType?: string;
  sizeBytes?: number;
}

export interface OrderResponse {
  id: number;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNotes?: string;
  status: OrderStatus;
  configuration: unknown;
  estimatedPrice?: number | null;
   customerRejectNote?: string | null;
   managerRejectNote?: string | null;
   linkDone?: string | null;
   doneNote?: string | null;
   attachments?: OrderAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequestBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNotes?: string;
  configuration: unknown;
  estimatedPrice?: number | null;
}
