import { PageRequest, PageResponse } from "@/components/types/Page";
import {
  getAllOrders,
  getMyOrders,
  searchAdminOrdersByConditions,
  searchMyOrdersByConditions,
  submitOrder,
  updateOrderStatus,
} from "@/services/OrderApi";
import type {
  CreateOrderRequestBody,
  OrderResponse,
  OrderStatus,
} from "@/types/orders";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface OrdersState {
  orders: PageResponse<OrderResponse[]> | null;
  loading: boolean;
  error: string;
  submitting: boolean;
  submitError: string;
  searching: boolean;
}

export const getMyOrdersAction = createAsyncThunk<
  PageResponse<OrderResponse[]>,
  PageRequest
>("getMyOrdersAction", async (data: PageRequest) => {
  try {
    const response = await getMyOrders(data);
    return response.data as PageResponse<OrderResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const searchMyOrdersAction = createAsyncThunk<
  PageResponse<OrderResponse[]>,
  PageRequest & { keyword: string | null; status: OrderStatus | null }
>(
  "searchMyOrdersAction",
  async (data: PageRequest & { keyword: string | null; status: OrderStatus | null }) => {
    try {
      const response = await searchMyOrdersByConditions(data);
      return response.data as PageResponse<OrderResponse[]>;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
);

export const submitOrderAction = createAsyncThunk<
  OrderResponse,
  { body: CreateOrderRequestBody; files?: File[] }
>(
  "submitOrderAction",
  async ({ body, files }) => {
    try {
      const response = await submitOrder({ body }, files ?? []);
      return response.data as OrderResponse;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
);

export const getAllOrdersAction = createAsyncThunk<
  PageResponse<OrderResponse[]>,
  PageRequest
>("getAllOrdersAction", async (data: PageRequest) => {
  try {
    const response = await getAllOrders(data);
    return response.data as PageResponse<OrderResponse[]>;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

export const searchAdminOrdersAction = createAsyncThunk<
  PageResponse<OrderResponse[]>,
  PageRequest & { keyword: string | null; status: OrderStatus | null }
>(
  "searchAdminOrdersAction",
  async (data: PageRequest & { keyword: string | null; status: OrderStatus | null }) => {
    try {
      const response = await searchAdminOrdersByConditions(data);
      return response.data as PageResponse<OrderResponse[]>;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },
);

export const updateOrderStatusAction = createAsyncThunk<
  OrderResponse,
  { id: number; status: OrderStatus; rejectNote?: string | null; linkDone?: string | null; doneNote?: string | null }
>("updateOrderStatusAction", async (data) => {
  try {
    const response = await updateOrderStatus(data);
    return response.data as OrderResponse;
  } catch (err: any) {
    throw new Error(err.message);
  }
});

const initialState: OrdersState = {
  orders: null,
  loading: false,
  error: "",
  submitting: false,
  submitError: "",
  searching: false,
};

const OrdersSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyOrdersAction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        getMyOrdersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<OrderResponse[]>>) => {
          state.loading = false;
          state.orders = action.payload;
        },
      )
      .addCase(getMyOrdersAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tải lịch sử đơn hàng.";
      })
      .addCase(searchMyOrdersAction.pending, (state) => {
        state.searching = true;
        state.error = "";
      })
      .addCase(
        searchMyOrdersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<OrderResponse[]>>) => {
          state.searching = false;
          state.orders = action.payload;
        },
      )
      .addCase(searchMyOrdersAction.rejected, (state, action) => {
        state.searching = false;
        state.error =
          action.error.message || "Không thể tìm kiếm đơn hàng. Vui lòng thử lại.";
      })
      .addCase(submitOrderAction.pending, (state) => {
        state.submitting = true;
        state.submitError = "";
      })
      .addCase(
        submitOrderAction.fulfilled,
        (state, action: PayloadAction<OrderResponse>) => {
          state.submitting = false;
          if (state.orders) {
            state.orders.data = [action.payload, ...state.orders.data];
            state.orders.totalElements += 1;
          } else {
            state.orders = {
              data: [action.payload],
              pageNumber: 0,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
            };
          }
        },
      )
      .addCase(submitOrderAction.rejected, (state, action) => {
        state.submitting = false;
        state.submitError =
          action.error.message || "Không thể gửi đơn hàng. Vui lòng thử lại.";
      })
      .addCase(getAllOrdersAction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        getAllOrdersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<OrderResponse[]>>) => {
          state.loading = false;
          state.orders = action.payload;
        },
      )
      .addCase(getAllOrdersAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể tải danh sách đơn hàng.";
      })
      .addCase(searchAdminOrdersAction.pending, (state) => {
        state.searching = true;
        state.error = "";
      })
      .addCase(
        searchAdminOrdersAction.fulfilled,
        (state, action: PayloadAction<PageResponse<OrderResponse[]>>) => {
          state.searching = false;
          state.orders = action.payload;
        },
      )
      .addCase(searchAdminOrdersAction.rejected, (state, action) => {
        state.searching = false;
        state.error =
          action.error.message || "Không thể tìm kiếm đơn hàng. Vui lòng thử lại.";
      })
      .addCase(updateOrderStatusAction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        updateOrderStatusAction.fulfilled,
        (state, action: PayloadAction<OrderResponse>) => {
          state.loading = false;
          if (state.orders?.data) {
            state.orders.data = state.orders.data.map((o) =>
              o.id === action.payload.id ? action.payload : o,
            );
          }
        },
      )
      .addCase(updateOrderStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Không thể cập nhật trạng thái đơn hàng.";
      });
  },
});

export default OrdersSlice.reducer;
