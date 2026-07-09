import { ApiResponse } from "@/components/types/ApiResponse";
import { PageRequest, PageResponse } from "@/components/types/Page";
import { axiosInstance } from "@/lib/utils/axios-instance";
import type {
  CreateOrderRequestBody,
  OrderResponse,
  OrderStatus,
} from "@/types/orders";

export const getMyOrders = async (data: PageRequest) => {
  try {
    const res = await axiosInstance.get("/orders/me", {
      params: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
      },
    });
    return res as unknown as ApiResponse<PageResponse<OrderResponse[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const searchMyOrdersByConditions = async (
  data: PageRequest & {
    keyword: string | null;
    status: OrderStatus | null;
  },
) => {
  try {
    const res = await axiosInstance.get("/orders/search-conditions", {
      params: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        keyword: data.keyword,
        status: data.status,
      },
    });
    return res as unknown as ApiResponse<PageResponse<OrderResponse[]>>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const submitOrder = async (
  data: { body: CreateOrderRequestBody },
  files: File[] = [],
) => {
  try {
    const formData = new FormData();
    if (data.body.customerName != null)
      formData.append("customerName", data.body.customerName);
    if (data.body.customerEmail != null)
      formData.append("customerEmail", data.body.customerEmail);
    if (data.body.customerPhone != null)
      formData.append("customerPhone", data.body.customerPhone);
    if (data.body.orderNotes != null)
      formData.append("orderNotes", data.body.orderNotes);
    if (data.body.configuration != null)
      formData.append("configuration", JSON.stringify(data.body.configuration));
    if (data.body.estimatedPrice != null)
      formData.append("estimatedPrice", String(data.body.estimatedPrice));

    for (const file of files) {
      formData.append("files", file);
    }

    const res = await axiosInstance.post("/orders/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res as unknown as ApiResponse<OrderResponse>;
  } catch (err: any) {
    throw new Error(err.message);
  }
};
