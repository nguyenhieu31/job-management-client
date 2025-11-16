# Job Management Table - Role-Based Access Control

## Tổng quan

Hệ thống bảng quản lý công việc với phân quyền theo vai trò (Role-Based Access Control). Mỗi vai trò sẽ thấy các cột khác nhau và có quyền chỉnh sửa khác nhau.

## Các vai trò (Roles)

### 1. Manager (Quản lý)
**Quyền xem:**
- Code
- Date
- Customer Name
- Case Name
- Total Price
- Link Input
- Link Done
- Input Count
- Output Count
- File Price
- Job Status ⚙️ (editable)
- Payment Status ⚙️ (editable)
- Note
- Assigned Employee ⚙️ (editable)
- QA ⚙️ (editable)
- Actions (Edit, Delete)

**Quyền chỉnh sửa:**
- Tất cả các trường có dropdown (Job Status, Payment Status, Assigned Employee, QA)
- Có thể xóa job

### 2. QA (Quality Assurance)
**Quyền xem:**
- Code
- Date
- Case Name
- Link Input
- Link Done
- Input Count
- Output Count
- Job Status ⚙️ (editable)
- Note
- Assigned Employee
- Actions (Edit only)

**Quyền chỉnh sửa:**
- Job Status (có thể thay đổi trạng thái job)
- Không thể xóa job

### 3. Employee (Nhân viên)
**Quyền xem:**
- Code
- Date
- Case Name
- Link Input
- Link Done
- Input Count
- Output Count
- Job Status ⚙️ (editable)
- Note
- Actions (Edit only)

**Quyền chỉnh sửa:**
- Job Status (có thể cập nhật trạng thái công việc của mình)
- Không thể xóa job

## Các trạng thái

### Job Status
- `pending` - Đang chờ
- `in-progress` - Đang thực hiện
- `done` - Hoàn thành
- `review` - Đang review

### Payment Status (chỉ Manager thấy)
- `unpaid` - Chưa thanh toán
- `partial` - Thanh toán một phần
- `paid` - Đã thanh toán đủ

## Cách sử dụng

### 1. Cập nhật Job Type

File: `src/types/jobs.tsx`

```typescript
export interface Job {
  id: number
  code: string
  date: string
  customerName: string
  caseName: string
  linkInput: string
  linkDone: string
  inputCount: number
  outputCount: number
  filePrice: number
  totalPrice: number
  jobStatus: JobStatus
  paymentStatus: PaymentStatus
  note: string
  assignedEmployee: string
  qa: string
}
```

### 2. Sử dụng JobTable Component

```tsx
import { JobTable } from "@/components/jobs/job-table"
import type { UserRole } from "@/types/jobs"

// Trong component của bạn
const userRole: UserRole = "manager" // hoặc "qa", "employee"

const employeesList = [
  { value: "emp1", label: "John Doe" },
  { value: "emp2", label: "Jane Smith" },
]

const qaList = [
  { value: "qa1", label: "Alice QA" },
  { value: "qa2", label: "Charlie QA" },
]

<JobTable 
  jobs={jobs}
  userRole={userRole}
  employees={employeesList}
  qaList={qaList}
  onEdit={handleEditJob}
  onDelete={handleDeleteJob}
  onUpdateField={handleUpdateField}
/>
```

### 3. Xử lý cập nhật field

```tsx
const handleUpdateField = (jobId: number, field: string, value: string) => {
  // Cập nhật state local
  setJobs(jobs.map((job) => 
    job.id === jobId ? { ...job, [field]: value } : job
  ))
  
  // Gọi API để cập nhật
  updateJobFieldAPI(jobId, field, value)
    .then(() => {
      toast.success("Updated successfully")
    })
    .catch(() => {
      toast.error("Failed to update")
    })
}
```

### 4. Lấy role từ Redux

```tsx
import { useAppSelector } from "@/store/store"

const roleName = useAppSelector((state) => state.authenticate.roleName)

const getUserRole = (): UserRole => {
  const role = roleName?.toLowerCase()
  if (role === "manager" || role === "admin") return "manager"
  if (role === "qa") return "qa"
  return "employee"
}

const userRole = getUserRole()
```

## Tính năng

### Editable Dropdown
- Các trường có thể chỉnh sửa sẽ hiển thị dạng dropdown
- Click vào dropdown để chọn giá trị mới
- Giá trị tự động được lưu khi thay đổi
- Manager có quyền chỉnh sửa nhiều field nhất

### Responsive Design
- Bảng có thanh cuộn ngang trên màn hình nhỏ
- Tự động điều chỉnh theo kích thước màn hình

### Color Coding
- Job Status: màu khác nhau cho từng trạng thái
- Payment Status: màu đỏ (unpaid), cam (partial), xanh (paid)

## API Integration

Khi tích hợp với backend, bạn cần:

1. **Get Jobs API**: Lấy danh sách jobs với đầy đủ thông tin
2. **Update Field API**: Cập nhật từng field riêng lẻ
   ```typescript
   PATCH /api/jobs/:id/field
   Body: { field: "jobStatus", value: "done" }
   ```
3. **Get Employees API**: Lấy danh sách nhân viên cho dropdown
4. **Get QA List API**: Lấy danh sách QA cho dropdown

## Demo

Truy cập `/dashboard/job` để xem demo với:
- 3 jobs mẫu
- Role được lấy từ Redux store
- Có thể thay đổi các dropdown để test chức năng

## Mở rộng

### Thêm cột mới
1. Cập nhật `Job` interface trong `types/jobs.tsx`
2. Thêm tên cột vào `ROLE_COLUMNS` cho role tương ứng
3. Thêm label vào `columnLabels` trong `job-table.tsx`
4. Thêm case mới trong `renderCell()` function

### Thêm role mới
1. Thêm role vào `UserRole` type
2. Thêm cấu hình cột trong `ROLE_COLUMNS`
3. Cập nhật logic `canEditField()` nếu cần

## Lưu ý
- Chỉ Manager mới có quyền xóa job
- Tất cả roles đều có thể cập nhật Job Status
- Links tự động mở tab mới khi click
- Giá tiền được format với dấu phẩy
