# 📄 Trang Tạo Hoá Đơn Thanh Toán - Tóm Tắt Triển Khai

## ✅ Đã Hoàn Thành

### 1. **Types** (`src/types/invoices.tsx`)
- `Invoice` - Hoá đơn chính
- `InvoiceItem` - Chi tiết item trong hoá đơn
- `InvoiceRequest` - Request tạo hoá đơn
- `InvoiceResponse` - Response từ API
- `JobsByCustomer` - Nhóm công việc theo khách hàng
- `InvoiceStatus` - Trạng thái hoá đơn (DRAFT, PENDING, PAID, CANCELLED)

### 2. **API Service** (`src/services/InvoiceApi.tsx`)
- ✅ `getUnpaidJobs()` - Lấy công việc chưa/bán thanh toán
- ✅ `createInvoice()` - Tạo hoá đơn nháp
- ✅ `submitInvoice()` - Gửi hoá đơn (PayPal)
- ✅ `getInvoice()` - Lấy chi tiết hoá đơn
- ✅ `getAllInvoices()` - Lấy danh sách hoá đơn
- ✅ `updateInvoice()` - Cập nhật hoá đơn
- ✅ `cancelInvoice()` - Hủy hoá đơn

### 3. **Redux Slice** (`src/store/slice/invoices/Invoices.tsx`)
- ✅ State: `jobsByCustomer`, `currentInvoice`, `invoices`, `previewInvoice`, `loading`, `error`
- ✅ Thunks: `fetchUnpaidJobs`, `createInvoice`, `submitInvoice`, `getAllInvoices`
- ✅ Actions: `setPreviewInvoice`, `clearPreviewInvoice`, `clearError`
- ✅ Tích hợp vào store

### 4. **UI Components**

#### a) **InvoiceList** (`src/components/invoices/invoice-list.tsx`)
- ✅ Hiển thị danh sách khách hàng
- ✅ Expand/collapse khách hàng
- ✅ Bảng chi tiết công việc với checkbox
- ✅ Nút "Tạo Hoá Đơn" cho từng khách hàng
- ✅ Hiển thị trạng thái thanh toán (UNPAID/PARTIAL)
- ✅ Tính toán tổng tiền

#### b) **InvoicePreviewDialog** (`src/components/invoices/invoice-preview-dialog.tsx`)
- ✅ Dialog hiển thị hoá đơn chi tiết
- ✅ Thông tin khách hàng
- ✅ Danh sách công việc trong hoá đơn
- ✅ Tóm tắt tài chính (Subtotal, Tax, Total)
- ✅ Nút "Gửi Hoá Đơn"
- ✅ Nút "Hủy"

### 5. **Page** (`src/app/dashboard/invoices/page.tsx`)
- ✅ Tải dữ liệu khi mount
- ✅ Thống kê: Tổng khách hàng, công việc, tiền
- ✅ Xử lý tạo hoá đơn
- ✅ Xử lý gửi hoá đơn
- ✅ Toast notifications
- ✅ Loading state
- ✅ Error handling

### 6. **UI Utils**
- ✅ `Checkbox` component (`src/components/ui/checkbox.tsx`)
- ✅ `Alert` component (`src/components/ui/alert.tsx`)

### 7. **Navigation**
- ✅ Menu "Hoá Đơn" trong sidebar
- ✅ Icon: FileText
- ✅ Route: `/dashboard/invoices`
- ✅ Chỉ hiển thị cho Manager

### 8. **Documentation**
- ✅ `INVOICES_GUIDE.md` - Hướng dẫn chi tiết

## 🎨 Giao Diện

### Trang Chính
```
┌─────────────────────────────────────┐
│ Tạo Hoá Đơn Thanh Toán              │
│ Quản lý và tạo hoá đơn...           │
├─────────────────────────────────────┤
│ Thống Kê:                           │
│ • Tổng Khách Hàng: 5                │
│ • Tổng Công Việc: 12                │
│ • Tổng Số Tiền: 50,000,000 VND      │
├─────────────────────────────────────┤
│                                     │
│ ▶ Khách Hàng A - 10,000,000 VND     │
│   (5 công việc)                     │
│                                     │
│ ▶ Khách Hàng B - 15,000,000 VND     │
│   (4 công việc)                     │
│                                     │
│ ...                                 │
└─────────────────────────────────────┘
```

### Expand Khách Hàng
```
┌─────────────────────────────────────┐
│ ▼ Khách Hàng A - 10,000,000 VND     │
│   email@example.com                 │
├─────────────────────────────────────┤
│ ☑ │ Mã  │ Tên Job  │ Status │ Tiền  │
│ ☐ │ J1  │ Job 1    │ 🔴 Chưa│ 2M   │
│ ☐ │ J2  │ Job 2    │ 🟠 Bán │ 3M   │
│ ☐ │ J3  │ Job 3    │ 🔴 Chưa│ 5M   │
├─────────────────────────────────────┤
│                  [Tạo Hoá Đơn (0)] → │
└─────────────────────────────────────┘
```

### Dialog Xem Trước
```
┌──────────────────────────────────────┐
│ 📄 Xem Trước Hoá Đơn                 │
├──────────────────────────────────────┤
│                                      │
│ Hoá Đơn #INV-2024-001               │
│ Ngày tạo: 21/10/2024                │
│                                      │
│ Thông Tin Khách Hàng:                │
│ • Tên: Khách Hàng A                  │
│ • Email: customer@example.com        │
│ • Điện Thoại: 0123456789            │
│ • Công Ty: Company Name              │
│                                      │
│ Chi Tiết Công Việc:                  │
│ ┌─────────────────────────────────┐ │
│ │ J1  │ Job 1 │ 2,000,000 VND    │ │
│ │ J2  │ Job 2 │ 3,000,000 VND    │ │
│ │ J3  │ Job 3 │ 5,000,000 VND    │ │
│ └─────────────────────────────────┘ │
│                                      │
│ Tổng Cộng:        10,000,000 VND    │
│ Thuế (0%):               0 VND       │
│ ────────────────────────────────     │
│ Tổng Cần Thanh:   10,000,000 VND    │
│                                      │
│ [Hủy]  [💰 Gửi Hoá Đơn]             │
└──────────────────────────────────────┘
```

## 🔌 Backend API Endpoints Cần Triển Khai

```typescript
// GET /admin/invoices/unpaid-jobs
Response: {
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
    paymentStatus: "UNPAID" | "PARTIAL";
  }[];
  totalAmount: number;
}[]

// POST /admin/invoices/create
Request: {
  jobIds: number[];
  customerId: number;
  notes?: string;
}
Response: {
  id: number;
  invoiceNumber: string;
  customerId: number;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "DRAFT";
  ...
}

// POST /admin/invoices/{id}/submit
// Gửi tới PayPal
Response: {
  status: "PENDING";
  paypalTransactionId?: string;
  ...
}

// GET /admin/invoices/{id}
Response: InvoiceResponse

// GET /admin/invoices?page=1&pageSize=10
Response: {
  data: InvoiceResponse[];
  pagination: { ... }
}

// PUT /admin/invoices/{id}
Request: Partial<InvoiceRequest>
Response: InvoiceResponse

// PUT /admin/invoices/{id}/cancel
Response: InvoiceResponse (status: "CANCELLED")
```

## 📋 Workflow

1. **Manager** nhấn menu "Hoá Đơn"
2. Trang tải danh sách công việc chưa/bán thanh toán (nhóm theo khách hàng)
3. **Expand** khách hàng để xem công việc
4. **Chọn** công việc cần tạo hoá đơn (checkbox)
5. Nhấn **"Tạo Hoá Đơn"**
6. Hệ thống gọi API tạo hoá đơn nháp
7. Dialog **xem trước** hoá đơn hiện lên
8. **Kiểm tra** thông tin
9. Nhấn **"Gửi Hoá Đơn"** → gửi tới PayPal
10. Hoá đơn được lưu với trạng thái PENDING
11. Danh sách tự động làm mới
12. Toast thông báo thành công

## 📚 File Structure

```
src/
├── types/
│   └── invoices.tsx ✅
├── services/
│   └── InvoiceApi.tsx ✅
├── store/
│   └── slice/invoices/
│       └── Invoices.tsx ✅
├── components/
│   ├── ui/
│   │   ├── checkbox.tsx ✅
│   │   └── alert.tsx ✅
│   └── invoices/
│       ├── invoice-list.tsx ✅
│       └── invoice-preview-dialog.tsx ✅
├── app/dashboard/
│   └── invoices/
│       └── page.tsx ✅
└── INVOICES_GUIDE.md ✅
```

## 🎯 Tính Năng

- ✅ Hiển thị công việc chưa/bán thanh toán
- ✅ Nhóm theo khách hàng
- ✅ Chọn công việc (single/multi/all)
- ✅ Tạo hoá đơn tự động
- ✅ Xem trước hoá đơn
- ✅ Gửi hoá đơn (PayPal - backend)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

## ⚙️ Setup Lần Đầu

1. **Cài đặt dependencies** (nếu chưa có):
   ```bash
   npm install @radix-ui/react-checkbox class-variance-authority
   ```

2. **Cập nhật backend** API endpoints theo spec trên

3. **Test workflow** end-to-end

4. **Config PayPal** ở backend (nếu chưa có)

## 🚀 Next Steps

- [ ] Implement backend endpoints
- [ ] Config PayPal integration
- [ ] Test hoá đơn tự động tạo
- [ ] Test gửi PayPal
- [ ] Add thêm tính năng: Edit hoá đơn, Download PDF, etc.

---

**Status**: ✅ Frontend hoàn thành
**Date**: Oct 21, 2025
**Quyền truy cập**: Manager only
