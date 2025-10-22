# 🎨 Hướng Dẫn Dùng Mock Data cho Trang Invoices

## Cách Bật Mock Data

### 1. **Bật Mock Data (Nhanh nhất)**

Mở file `.env` và thay đổi:

```env
# Thay từ
NEXT_PUBLIC_USE_MOCK_DATA=false

# Thành
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. **Restart Dev Server**

```bash
npm run dev
```

### 3. **Vào Trang Invoices**

Nhấn menu "Hoá Đơn" hoặc truy cập: `http://localhost:3000/dashboard/invoices`

## Mock Data Có Sẵn

### Khách Hàng & Công Việc

| #  | Khách Hàng        | Email                  | Công Việc | Tổng Tiền     |
|----|------------------|------------------------|-----------|-----------:
| 1  | Công Ty ABC       | contact@abc.com        | 4 việc    | 15.000.000 |
| 2  | Công Ty XYZ       | billing@xyz.com        | 3 việc    | 22.500.000 |
| 3  | Nhà Hàng Mekong   | admin@mekong.vn        | 2 việc    | 8.500.000  |
| 4  | Công Ty Edu Plus  | finance@eduplus.edu.vn | 3 việc    | 18.000.000 |
| 5  | Startup TechHub   | payment@techhub.io     | 2 việc    | 12.500.000 |

**Tổng**: 14 công việc, **76.500.000 VND**

### Chi Tiết Công Việc (Công Ty ABC)

```
JOB-2024-001: Dịch thuật tài liệu tiếng Anh
   Status: 🔴 Chưa Thanh Toán
   Tiền: 3.000.000 VND

JOB-2024-002: Chỉnh sửa video quảng cáo
   Status: 🔴 Chưa Thanh Toán
   Tiền: 5.000.000 VND

JOB-2024-003: Thiết kế banner và poster
   Status: 🟠 Thanh Toán Một Phần
   Tiền: 4.000.000 VND

JOB-2024-004: Viết nội dung blog marketing
   Status: 🔴 Chưa Thanh Toán
   Tiền: 3.000.000 VND
```

## Quy Trình Test

### ✅ Bước 1: Xem Danh Sách

1. Vào `/dashboard/invoices`
2. Thấy 5 khách hàng với danh sách công việc
3. Kiểm tra:
   - ✓ Thống kê hiển thị đúng (5 khách hàng, 14 việc, 76.5M VND)
   - ✓ Thông tin khách hàng đầy đủ

### ✅ Bước 2: Expand Khách Hàng

1. Nhấn ▶ trên khách hàng bất kỳ (ví dụ: Công Ty ABC)
2. Xem danh sách công việc chi tiết:
   - ✓ Mã job
   - ✓ Tên job
   - ✓ Status (UNPAID/PARTIAL)
   - ✓ Số tiền

### ✅ Bước 3: Chọn Công Việc

1. Chọn 1-2 công việc bằng checkbox
2. Hoặc nhấn checkbox header để chọn tất cả
3. Xem nút "Tạo Hoá Đơn" cập nhật số lượng

### ✅ Bước 4: Tạo Hoá Đơn

1. Nhấn "Tạo Hoá Đơn"
2. Xem dialog tải (1 giây)
3. Dialog xem trước hiển thị:
   - ✓ Số hoá đơn (random)
   - ✓ Ngày tạo
   - ✓ Thông tin khách hàng
   - ✓ Bảng công việc
   - ✓ Tổng cộng
   - ✓ Nút "Gửi Hoá Đơn"

### ✅ Bước 5: Gửi Hoá Đơn

1. Kiểm tra thông tin trong dialog
2. Nhấn "Gửi Hoá Đơn"
3. Xem loading (1 giây)
4. Toast thông báo thành công
5. Dialog đóng tự động

## File Mock Data

### Vị Trí
```
src/lib/mock-data.ts
```

### Cấu Trúc

```typescript
// Mock data cho 5 khách hàng
export const mockJobsByCustomer: JobsByCustomer[]

// Mock invoice example
export const mockInvoice: InvoiceResponse
```

### Thêm/Sửa Mock Data

Mở `src/lib/mock-data.ts` và chỉnh sửa:

```typescript
export const mockJobsByCustomer: JobsByCustomer[] = [
  {
    customerId: 1,
    customerName: "Công Ty ABC",
    customerEmail: "contact@abc.com",
    customerPhone: "0123456789",
    customerCompany: "ABC Corporation",
    totalAmount: 15000000,
    jobs: [
      {
        id: 1,
        code: "JOB-2024-001",
        caseName: "Dịch thuật tài liệu tiếng Anh",
        totalPrice: 3000000,
        paymentStatus: "UNPAID",
      },
      // ... thêm công việc khác
    ],
  },
  // ... thêm khách hàng khác
];
```

## Chuyển Sang Real API

Khi backend sẵn sàng, chỉ cần:

### 1. Tắt Mock Data
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 2. Restart Dev Server
```bash
npm run dev
```

**Không cần thay đổi code khác!**

## Debugging

### Kiểm Tra Mock Data Đang Active

Mở DevTools → Console:

```javascript
// Sẽ hiển thị "true" nếu mock data active
console.log(process.env.NEXT_PUBLIC_USE_MOCK_DATA);
```

### Xem Redux State

Cài đặt Redux DevTools:
- Chrome: Redux DevTools extension
- Sau đó mở DevTools → Redux

Xem state trong tab "State":
```
invoices > jobsByCustomer: Array(5)
invoices > previewInvoice: null hoặc Object
invoices > loading: boolean
invoices > error: null hoặc string
```

### Test Tất Cả Trường Hợp

1. **Bình thường**: Chọn 1 job → Tạo → Gửi
2. **Chọn tất cả**: Nhấn checkbox header → Tạo → Gửi
3. **Chuyển khách hàng**: Chọn khách hàng khác → Chọn job → Tạo
4. **Empty state**: Khi không có công việc (thay mockJobsByCustomer = [])

## Mẹo

💡 **Nhanh chóng test loading state**: Chỉ cần click nhanh "Tạo Hoá Đơn" nhiều lần trước khi dialog mở

💡 **Thêm delay giả lập**: Chỉnh `setTimeout` trong `Invoices.tsx`:

```typescript
// Từ 500ms
await new Promise((resolve) => setTimeout(resolve, 500));

// Thành 2000ms (2 giây)
await new Promise((resolve) => setTimeout(resolve, 2000));
```

💡 **Xem real API call**: Mở Network tab, tắt mock data, bạn sẽ thấy request tới API

## Troubleshooting

### ❌ Mock data không hiển thị

1. Kiểm tra `.env`: `NEXT_PUBLIC_USE_MOCK_DATA=true`?
2. Restart server: `npm run dev`
3. Refresh browser: `Ctrl+Shift+R` (hard refresh)
4. Xóa cache: DevTools → Settings → Network → "Disable cache"

### ❌ Toast notification không hiển thị

- Kiểm tra `src/app/layout.tsx` có `<ToastContainer>` không?
- Redux DevTools có hiển thị action không?

### ❌ Dialog không mở

- Console có error không? (F12 → Console)
- Preview invoice state có được set không? (Redux DevTools)

---

**Status**: ✅ Mock data sẵn sàng
**Date**: Oct 22, 2025
**Command**: `NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev`
