# Hướng Dẫn Tính Năng Tạo Hoá Đơn Thanh Toán

## Tổng Quan

Trang **Tạo Hoá Đơn Thanh Toán** cho phép Manager quản lý và tạo hoá đơn cho các công việc đã hoàn thành nhưng chưa thanh toán hoặc thanh toán một phần.

## Vị Trí

- **Menu**: Công Việc → Hoá Đơn (hoặc `/dashboard/invoices`)
- **Quyền Truy Cập**: Chỉ Manager

## Chức Năng

### 1. Xem Danh Sách Công Việc Chưa Thanh Toán

**Hiển Thị**:
- Danh sách khách hàng có công việc chưa thanh toán hoặc thanh toán một phần
- Thống kê:
  - Tổng số khách hàng
  - Tổng số công việc
  - Tổng số tiền cần thanh toán

**Chi Tiết Mỗi Khách Hàng**:
- Tên khách hàng
- Email
- Công ty (nếu có)
- Tổng số tiền của khách hàng

### 2. Mở Rộng/Thu Gọn Khách Hàng

Nhấn vào nút mũi tên (▶/▼) hoặc bất kỳ chỗ nào trên hàng khách hàng để:
- Xem danh sách chi tiết công việc của khách hàng đó
- Chọn các công việc để tạo hoá đơn

### 3. Lựa Chọn Công Việc

**Cách Chọn**:
- ☐ Chọn từng công việc riêng lẻ bằng checkbox
- ☑ Hoặc chọn tất cả công việc của khách hàng bằng header checkbox

**Thông Tin Công Việc**:
- **Mã Job**: Mã định danh công việc
- **Tên Job**: Tên công việc
- **Trạng Thái Thanh Toán**: 
  - 🔴 Chưa Thanh Toán (UNPAID)
  - 🟠 Thanh Toán Một Phần (PARTIAL)
- **Số Tiền**: Số tiền chưa thanh toán

### 4. Tạo Hoá Đơn

**Bước 1: Chọn Công Việc**
- Chọn ít nhất 1 công việc từ một khách hàng
- Nút "Tạo Hoá Đơn" sẽ được kích hoạt

**Bước 2: Nhấn "Tạo Hoá Đơn"**
- Hệ thống sẽ tạo hoá đơn nháp
- Hoá đơn được hiển thị trong dialog xem trước

### 5. Xem Trước Hoá Đơn

Dialog xem trước hiển thị:

**Thông Tin Hoá Đơn**:
- Số hoá đơn (tự động tạo)
- Ngày tạo
- Trạng thái (DRAFT/PENDING)

**Thông Tin Khách Hàng**:
- Tên đầy đủ
- Email
- Số điện thoại
- Công ty

**Chi Tiết Công Việc**:
- Bảng liệt kê tất cả công việc trong hoá đơn
- Mã job, tên job, số tiền

**Tóm Tắt Tài Chính**:
- Tổng cộng (Subtotal)
- Thuế (0%)
- Tổng cần thanh toán (TOTAL)

### 6. Gửi Hoá Đơn

**Trước Khi Gửi**:
- Kiểm tra lại toàn bộ thông tin
- Xác nhận số tiền và công việc

**Nhấn "Gửi Hoá Đơn"**:
- Hoá đơn được gửi tới API PayPal (xử lý backend)
- Trạng thái thay đổi từ DRAFT → PENDING
- Dialog sẽ đóng tự động
- Danh sách được làm mới

**Kết Quả**:
- ✅ Hoá đơn được ghi nhận trong hệ thống
- Công việc sẽ được cập nhật trạng thái thanh toán
- Có thể xem hoá đơn đã gửi ở trang quản lý hoá đơn

## API Endpoints (Backend)

Các endpoint cần triển khai:

| Endpoint | Method | Mô Tả |
|----------|--------|-------|
| `/admin/invoices/unpaid-jobs` | GET | Lấy danh sách công việc chưa thanh toán theo khách hàng |
| `/admin/invoices/create` | POST | Tạo hoá đơn nháp từ danh sách công việc |
| `/admin/invoices/{id}/submit` | POST | Gửi hoá đơn (tích hợp PayPal) |
| `/admin/invoices` | GET | Lấy danh sách hoá đơn |
| `/admin/invoices/{id}` | GET | Lấy chi tiết hoá đơn |
| `/admin/invoices/{id}/cancel` | PUT | Hủy hoá đơn |

## State Management (Redux)

**Slice**: `invoices`

**Actions**:
- `fetchUnpaidJobs`: Tải danh sách công việc chưa thanh toán
- `createInvoice`: Tạo hoá đơn nháp
- `submitInvoice`: Gửi hoá đơn
- `getAllInvoices`: Tải danh sách hoá đơn
- `setPreviewInvoice`: Hiển thị dialog xem trước
- `clearPreviewInvoice`: Đóng dialog xem trước

**State**:
```typescript
{
  jobsByCustomer: JobsByCustomer[],      // Danh sách công việc theo khách hàng
  currentInvoice: InvoiceResponse | null, // Hoá đơn hiện tại
  invoices: InvoiceResponse[],            // Danh sách hoá đơn
  previewInvoice: InvoiceResponse | null, // Hoá đơn đang xem trước
  loading: boolean,
  error: string | null
}
```

## Types

```typescript
// Danh sách công việc theo khách hàng
interface JobsByCustomer {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  jobs: {
    id: number;
    code: string;
    caseName: string;
    totalPrice: number;
    paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  }[];
  totalAmount: number;
}

// Hoá đơn
interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
```

## Quy Trình Workflow

```
┌─────────────────────────────┐
│  Trang Tạo Hoá Đơn          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Xem Danh Sách Công Việc    │
│  (nhóm theo khách hàng)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Chọn Công Việc             │
│  (checkbox múi lựa)         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Tạo Hoá Đơn Nháp           │
│  (tự động từ API)           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Xem Trước Hoá Đơn          │
│  (Dialog)                   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Gửi Hoá Đơn → PayPal       │
│  (DRAFT → PENDING)          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Xác Nhận & Làm Mới         │
└─────────────────────────────┘
```

## Ghi Chú

- ⚠️ Hoá đơn được tạo ở trạng thái **DRAFT** (nháp) trước
- ⚠️ Chỉ khi gửi thì hoá đơn mới được gửi tới PayPal
- ⚠️ Có thể chỉnh sửa hoá đơn khi còn ở trạng thái DRAFT
- ✅ Tích hợp PayPal được cấu hình ở backend

