# Employee Payroll Guide - Hướng Dẫn Bảng Lương Nhân Viên

## 📋 Tổng Quan

Nhân viên và QA hiện có thể xem bảng lương của họ ngay khi quản lý duyệt hoá đơn. Chức năng này cho phép:

✅ Xem toàn bộ lịch sử bảng lương  
✅ Xem chi tiết từng kỳ lương  
✅ Theo dõi trạng thái thanh toán  
✅ Xem danh sách công việc hoàn thành và tiền công  

---

## 🎯 Cách Sử Dụng

### 1. **Truy Cập Trang Bảng Lương Của Tôi**

```
Bước 1: Đăng nhập với tài khoản Nhân Viên hoặc QA
Bước 2: Mở Sidebar (bên trái màn hình)
Bước 3: Nhấp vào "Bảng Lương Của Tôi"
Bước 4: Bạn sẽ được chuyển đến: /dashboard/my-payroll
```

### 2. **Xem Thông Tin Tóm Tắt**

Trang hiển thị 5 thẻ thông tin chính:

| Thẻ | Mô Tả | Ví Dụ |
|-----|-------|-------|
| **Tổng Kỳ Lương** | Số lượng kỳ lương | 6 kỳ |
| **Tổng Thu Nhập** | Tổng tiền kiếm được | 16,550,000 ₫ |
| **Chờ Duyệt** | Số kỳ đang chờ quản lý duyệt | 4 kỳ |
| **Đã Duyệt** | Tiền đã duyệt, chờ thanh toán | 2,300,000 ₫ |
| **Đã Thanh Toán** | Tiền đã thanh toán hoàn tất | 2,350,000 ₫ |

### 3. **Xem Lịch Sử Bảng Lương**

Bảng "Lịch Sử Bảng Lương" hiển thị:

| Cột | Mô Tả |
|-----|-------|
| **Kỳ Lương** | Tháng của bảng lương (VD: 2024-10) |
| **Tổng Job** | Số công việc hoàn thành |
| **Tính Công** | Tiền cơ bản tính toán từ công việc |
| **Khấu Trừ** | Tiền khấu trừ (bảo hiểm, thuế, ...) |
| **Thưởng** | Tiền thưởng nếu có |
| **Tổng Tiền** | Tổng tiền cuối cùng (tính công - khấu trừ + thưởng) |
| **Tình Trạng** | Trạng thái (Chờ duyệt / Đã duyệt / Đã thanh toán) |
| **Duyệt Ngày** | Ngày quản lý duyệt |
| **Thanh Toán Ngày** | Ngày chuyển khoản |
| **Chi Tiết** | Nút để xem chi tiết |

### 4. **Xem Chi Tiết Một Kỳ Lương**

```
Bước 1: Nhấp icon 👁️ (Xem) ở cuối hàng
Bước 2: Một panel chi tiết sẽ xuất hiện phía dưới bảng
```

Chi tiết hiển thị:

```
┌─────────────────────────────────────────┐
│ Chi Tiết Kỳ Lương 2024-10               │
├─────────────────────────────────────────┤
│ Số Job:              3                  │
│ Tính Công:           3,300,000 ₫        │
│ Khấu Trừ:            300,000 ₫          │
│ Thưởng:              200,000 ₫          │
├─────────────────────────────────────────┤
│ Tổng:                3,200,000 ₫        │
├─────────────────────────────────────────┤
│ Duyệt Ngày:          20/10/2024         │
│ Thanh Toán Ngày:     21/10/2024         │
│ Ghi Chú:             (nếu có)           │
└─────────────────────────────────────────┘

Chi Tiết Công Việc:
┌────────────┬──────────────┬─────────────┬────────────┐
│ Mã Job     │ Tên Công Việc│ Ngày Hoàn   │ Tiền       │
├────────────┼──────────────┼─────────────┼────────────┤
│ JOB-001    │ Website Dev  │ 15/10/2024  │ 1,500,000 ₫│
│ JOB-002    │ DB Design    │ 18/10/2024  │ 1,000,000 ₫│
│ JOB-003    │ API Integ.   │ 19/10/2024  │ 800,000 ₫  │
└────────────┴──────────────┴─────────────┴────────────┘
```

---

## 📊 Trạng Thái Bảng Lương

### 4 Trạng Thái Chính

```
1. 🟡 PENDING (Chờ Duyệt)
   - Quản lý chưa duyệt
   - Nhân viên chưa thể rút tiền
   - Màu: Vàng

2. 🔵 APPROVED (Đã Duyệt)
   - Quản lý đã duyệt
   - Chờ chuyển khoản
   - Màu: Xanh dương

3. 🟢 PAID (Đã Thanh Toán)
   - Tiền đã được chuyển vào tài khoản
   - Hoàn tất
   - Màu: Xanh lá

4. 🔴 REJECTED (Từ Chối)
   - Quản lý từ chối
   - Có lý do từ chối
   - Màu: Đỏ
```

---

## 💡 Các Tính Năng Chi Tiết

### A. Tóm Tắt Tài Chính

**Tổng Thu Nhập**: Cộng tất cả tiền từ tất cả kỳ lương
```
= Sum(total của tất cả kỳ)
= 3,200,000 + 3,250,000 + 2,300,000 + ... = 16,550,000 ₫
```

**Chờ Duyệt**: Số kỳ có trạng thái PENDING
```
= Count(status = "PENDING")
= 4 kỳ
```

**Đã Duyệt**: Tổng tiền ở trạng thái APPROVED
```
= Sum(total khi status = "APPROVED")
= 2,300,000 ₫
```

**Đã Thanh Toán**: Tổng tiền ở trạng thái PAID
```
= Sum(total khi status = "PAID")
= 2,350,000 ₫
```

### B. Chi Tiết Công Việc

Mỗi kỳ lương liệt kê các công việc đã hoàn thành:

```
JOB-001: Website Development
├─ Ngày hoàn thành: 15/10/2024
├─ Tiền công: 1,500,000 ₫
└─ Tính vào: Tính Công

JOB-002: Database Design
├─ Ngày hoàn thành: 18/10/2024
├─ Tiền công: 1,000,000 ₫
└─ Tính vào: Tính Công
```

### C. Tính Toán Tổng Tiền

```
Tổng Tiền = Tính Công - Khấu Trừ + Thưởng

VD:
Tính Công:  3,300,000 ₫
Khấu Trừ:  -  300,000 ₫  (bảo hiểm, thuế)
Thưởng:    +  200,000 ₫   (hiệu suất cao)
─────────────────────────
Tổng Tiền:  3,200,000 ₫
```

---

## 🔐 Quyền Hạn & Bảo Mật

### Ai Có Thể Xem?
- ✅ **Nhân Viên (EMPLOYEE)**
- ✅ **QA (QA)**
- ❌ **Quản Lý (MANAGER)** - Dùng trang "Bảng Lương" thay vì "Bảng Lương Của Tôi"

### Dữ Liệu Được Hiển Thị
- ✅ Bảng lương của chính mình
- ❌ Bảng lương của nhân viên khác
- ❌ Thông tin nhân sự nhạy cảm khác

### Quyền Chỉnh Sửa
- ❌ Nhân viên **không thể** chỉnh sửa bảng lương
- ❌ Nhân viên **không thể** xóa bảng lương
- ⚠️ Chỉ quản lý mới có thể cập nhật bảng lương

---

## 🔄 Quy Trình Thanh Toán

```
┌─────────────────────────────────────────────────┐
│ Quy Trình Thanh Toán Bảng Lương                 │
└─────────────────────────────────────────────────┘

1️⃣ PENDING (Chờ Duyệt)
   └─ Nhân viên hoàn thành công việc
   └─ Quản lý tính bảng lương
   └─ Status: PENDING (vàng)
      └─ Nhân viên xem được trạng thái

2️⃣ APPROVED (Đã Duyệt)
   └─ Quản lý nhấp "Duyệt"
   └─ Status: APPROVED (xanh dương)
      └─ Nhân viên biết sẽ được thanh toán sớm

3️⃣ PAID (Đã Thanh Toán)
   └─ Kế toán chuyển khoản
   └─ Status: PAID (xanh lá)
      └─ Nhân viên nhìn thấy ngày thanh toán

4️⃣ REJECTED (Từ Chối - Nếu Có Vấn Đề)
   └─ Quản lý nhấp "Từ Chối"
   └─ Nhập lý do từ chối
   └─ Status: REJECTED (đỏ)
      └─ Nhân viên thấy lý do và liên hệ quản lý
```

---

## 📱 Bố Cục Trang

```
┌────────────────────────────────────────────────┐
│  Bảng Lương Của Tôi                            │
│  Xem lịch sử bảng lương và chi tiết thanh toán │
└────────────────────────────────────────────────┘

┌─────────┬──────────┬────────┬──────────┬────────┐
│ Tổng KỲ │ Tổng TN  │ Chờ DK │ Đã Duyệt │ Thanh  │
│ 6 kỳ    │ 16.55M ₫ │ 4 kỳ   │ 2.3M ₫   │ 2.35M ₫│
└─────────┴──────────┴────────┴──────────┴────────┘

┌──────────────────────────────────────────────┐
│ Lịch Sử Bảng Lương                           │
├─────────────────────────────────────────────┤
│ [Bảng dữ liệu với các kỳ lương]              │
│                                              │
│ 2024-10  │  3 │ 3.3M │ 300k │ 200k │ 3.2M   │
│ 2024-09  │  2 │ 3.2M │ 250k │ 300k │ 3.25M  │
│ 2024-08  │  2 │ 2.4M │ 200k │ 100k │ 2.3M   │
│  ...                                         │
└──────────────────────────────────────────────┘

[Nhấn "Xem" để mở chi tiết]

┌──────────────────────────────────────────────┐
│ Chi Tiết Kỳ Lương 2024-10                    │
├──────────────────────────────────────────────┤
│ Số Job:              3                       │
│ Tính Công:           3,300,000 ₫             │
│ Khấu Trừ:            300,000 ₫               │
│ Thưởng:              200,000 ₫               │
│ Tổng:                3,200,000 ₫             │
├──────────────────────────────────────────────┤
│ Chi Tiết Công Việc:                          │
│ [Bảng công việc]                             │
└──────────────────────────────────────────────┘
```

---

## ⚙️ Mock Data (Tính Năng)

**Khi nào sử dụng Mock Data?**
- ✅ Quá trình phát triển
- ✅ Demonstration cho khách hàng
- ✅ Testing trước khi backend ready

**Cách bật Mock Data:**
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Mock Data có:**
- 6 nhân viên mẫu
- 3 kỳ lương (2024-10, 2024-09, 2024-08)
- Tất cả trạng thái (PENDING, APPROVED, PAID, REJECTED)
- Dữ liệu công việc chi tiết

**Cách tắt Mock Data:**
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## 🐛 Troubleshooting

### **Vấn đề**: Không thấy menu "Bảng Lương Của Tôi"
**Giải pháp:**
1. Kiểm tra bạn đã đăng nhập với vai trò EMPLOYEE hoặc QA
2. Refresh trang (F5 hoặc Cmd+R)
3. Kiểm tra sidebar menu

### **Vấn đề**: Không thấy bảng lương của mình
**Giải pháp:**
1. Quản lý chưa tính bảng lương cho bạn
2. Kiểm tra bạn đã hoàn thành công việc và được gán vào hoá đơn
3. Liên hệ quản lý để xác nhận

### **Vấn đề**: Ngày thanh toán không hiện
**Giải pháp:**
1. Bảng lương chưa được thanh toán (status: PENDING hoặc APPROVED)
2. Chờ quản lý duyệt rồi kế toán chuyển khoản

### **Vấn đề**: Số tiền không đúng
**Giải pháp:**
1. Kiểm tra: Tính Công = tổng tiền tất cả công việc
2. Kiểm tra: Tổng = Tính Công - Khấu Trừ + Thưởng
3. Liên hệ quản lý nếu vẫn không đúng

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có vấn đề:
1. Gửi thông báo cho quản lý
2. Cung cấp kỳ lương bị lỗi
3. Mô tả vấn đề chi tiết

---

## 📝 Tóm Tắt Tính Năng

| Tính Năng | Nhân Viên | QA | Quản Lý |
|-----------|----------|----|---------| 
| Xem bảng lương của mình | ✅ | ✅ | ❌ |
| Xem lịch sử | ✅ | ✅ | ❌ |
| Xem chi tiết | ✅ | ✅ | ❌ |
| Chỉnh sửa | ❌ | ❌ | ❌ |
| Xem tất cả nhân viên | ❌ | ❌ | ✅ |
| Duyệt bảng lương | ❌ | ❌ | ✅ |

---

**Cập nhật lần cuối:** October 22, 2024  
**Trạng thái:** ✅ Hoàn tất & Sẵn sàng sử dụng
