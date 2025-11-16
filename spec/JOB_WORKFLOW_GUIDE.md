# Job Management Workflow - Role-Based Actions

## Workflow Overview

```
PENDING → IN-PROGRESS → DONE → IN-REVIEW → REVIEWED → COMPLETED
   ↓           ↓          ↓         ↓           ↓          ↓
Employee   Employee     QA        QA       Manager   Final State
Takes      Completes   Takes    Submits   Completes
 Job         Job      Review    Review      Job
```

## Job Status Lifecycle

### 1. **PENDING** (Đang chờ)
- Job mới được tạo hoặc chưa có ai nhận
- **Employee action**: `Take Job` → chuyển sang **IN-PROGRESS**

### 2. **IN-PROGRESS** (Đang thực hiện)
- Employee đang làm việc
- **Employee action**: `Done Job` → chuyển sang **DONE**

### 3. **DONE** (Hoàn thành công việc)
- Employee đã hoàn thành, chờ QA kiểm tra
- **QA action**: `Take Review` → chuyển sang **IN-REVIEW**

### 4. **IN-REVIEW** (Đang review)
- QA đang kiểm tra chất lượng
- **QA action**: `Submit Review` → chuyển sang **REVIEWED**

### 5. **REVIEWED** (Đã review)
- QA đã kiểm tra xong, chờ Manager duyệt cuối
- **Manager action**: `Complete` → chuyển sang **COMPLETED**

### 6. **COMPLETED** (Hoàn thành)
- Job đã hoàn thành toàn bộ quy trình
- Trạng thái cuối cùng

## Role-Based Actions

### 👷 EMPLOYEE (Nhân viên)

**Quyền xem:**
- Code, Date, Case Name
- Link Input, Link Done
- Input Count, Output Count
- Job Status (read-only) ⚠️
- Note

**Actions:**
| Status | Button | Action | Next Status |
|--------|--------|--------|-------------|
| PENDING | 🎮 Take Job | Nhận job về làm | IN-PROGRESS |
| IN-PROGRESS | ✅ Done Job | Hoàn thành job | DONE |

**Lưu ý:**
- ❌ Không thể chỉnh sửa Job Status bằng dropdown
- ❌ Không thể xóa job
- ✅ Chỉ thấy Status dưới dạng badge (read-only)

---

### 🔍 QA (Quality Assurance)

**Quyền xem:**
- Code, Date, Case Name
- Link Input, Link Done
- Input Count, Output Count
- Job Status (read-only) ⚠️
- Note
- Assigned Employee

**Actions:**
| Status | Button | Action | Next Status |
|--------|--------|--------|-------------|
| DONE | 👁️ Take Review | Nhận job để review | IN-REVIEW |
| IN-REVIEW | 📤 Submit Review | Gửi kết quả review | REVIEWED |

**Lưu ý:**
- ❌ Không thể chỉnh sửa Job Status bằng dropdown
- ❌ Không thể xóa job
- ✅ Chỉ thấy Status dưới dạng badge (read-only)

---

### 👔 MANAGER (Quản lý)

**Quyền xem:**
- Tất cả thông tin (15 cột)
- Code, Date, Customer Name, Case Name
- Total Price, File Price
- Link Input, Link Done
- Input Count, Output Count
- Job Status (editable) ✏️
- Payment Status (editable) ✏️
- Note
- Assigned Employee (editable) ✏️
- QA (editable) ✏️

**Actions:**
| Status | Button | Action | Next Status |
|--------|--------|--------|-------------|
| REVIEWED | ✅ Complete | Hoàn thành cuối cùng | COMPLETED |
| Any | ✏️ Edit | Sửa thông tin job | - |
| Any | 🗑️ Delete | Xóa job | - |

**Đặc quyền:**
- ✅ Có thể chỉnh sửa Job Status bằng dropdown (bỏ qua workflow nếu cần)
- ✅ Có thể chỉnh sửa Payment Status
- ✅ Có thể phân công Employee và QA
- ✅ Có thể xóa job
- ✅ Quyền cuối cùng đánh dấu job COMPLETED

## UI Components

### Job Status Badge Colors

```typescript
PENDING     → 🟡 Yellow   (bg-yellow-500/10)
IN-PROGRESS → 🔵 Blue     (bg-blue-500/10)
DONE        → 🟢 Green    (bg-green-500/10)
IN-REVIEW   → 🟣 Purple   (bg-purple-500/10)
REVIEWED    → 🔮 Indigo   (bg-indigo-500/10)
COMPLETED   → 🟢 Emerald  (bg-emerald-500/10)
```

### Action Buttons

**Employee:**
- 🎮 `Take Job` - Blue button (bg-blue-600)
- ✅ `Done Job` - Green button (bg-green-600)

**QA:**
- 👁️ `Take Review` - Purple button (bg-purple-600)
- 📤 `Submit Review` - Indigo button (bg-indigo-600)

**Manager:**
- ✅ `Complete` - Emerald button (bg-emerald-600)
- ✏️ `Edit` - Ghost button with Pencil icon
- 🗑️ `Delete` - Ghost button with Trash icon (red)

## Implementation Details

### 1. Action Handler

```typescript
const handleJobAction = (jobId: number, action: JobAction) => {
  const job = jobs.find(j => j.id === jobId)
  
  let newStatus: JobStatus = job.jobStatus
  
  switch (action) {
    case "take-job":
      if (job.jobStatus === "pending") {
        newStatus = "in-progress"
      }
      break
    
    case "done-job":
      if (job.jobStatus === "in-progress") {
        newStatus = "done"
      }
      break
    
    case "take-review":
      if (job.jobStatus === "done") {
        newStatus = "in-review"
      }
      break
    
    case "submit-review":
      if (job.jobStatus === "in-review") {
        newStatus = "reviewed"
      }
      break
    
    case "complete-job":
      if (job.jobStatus === "reviewed") {
        newStatus = "completed"
      }
      break
  }
  
  // Update job status
  updateJobStatus(jobId, newStatus)
}
```

### 2. Available Actions Logic

```typescript
const getAvailableActions = (job: Job, userRole: UserRole): JobAction[] => {
  const actions: JobAction[] = []
  
  if (userRole === "manager") {
    actions.push("edit", "delete")
    if (job.jobStatus === "reviewed") {
      actions.push("complete-job")
    }
  } else if (userRole === "employee") {
    if (job.jobStatus === "pending") {
      actions.push("take-job")
    }
    if (job.jobStatus === "in-progress") {
      actions.push("done-job")
    }
  } else if (userRole === "qa") {
    if (job.jobStatus === "done") {
      actions.push("take-review")
    }
    if (job.jobStatus === "in-review") {
      actions.push("submit-review")
    }
  }
  
  return actions
}
```

### 3. Status Display

```typescript
// Manager: Can edit via dropdown
<EditableSelect
  value={job.jobStatus}
  options={jobStatusOptions}
  onSave={(value) => onUpdateField(job.id, "jobStatus", value)}
/>

// Employee & QA: Read-only badge
<Badge variant="outline" className={jobStatusColors[job.jobStatus]}>
  {jobStatusLabels[job.jobStatus]}
</Badge>
```

## API Integration

### Endpoints cần thiết:

```typescript
// 1. Take Job (Employee)
POST /api/jobs/:id/take
Body: { action: "take-job" }
Response: { status: "in-progress" }

// 2. Done Job (Employee)
POST /api/jobs/:id/done
Body: { action: "done-job" }
Response: { status: "done" }

// 3. Take Review (QA)
POST /api/jobs/:id/review/take
Body: { action: "take-review" }
Response: { status: "in-review" }

// 4. Submit Review (QA)
POST /api/jobs/:id/review/submit
Body: { action: "submit-review", reviewNote: string }
Response: { status: "reviewed" }

// 5. Complete Job (Manager)
POST /api/jobs/:id/complete
Body: { action: "complete-job" }
Response: { status: "completed" }
```

## Testing Scenarios

### Scenario 1: Employee Workflow
1. Login as Employee
2. See job with status PENDING
3. Click "Take Job" → status changes to IN-PROGRESS
4. Click "Done Job" → status changes to DONE
5. No more actions available (waiting for QA)

### Scenario 2: QA Workflow
1. Login as QA
2. See job with status DONE
3. Click "Take Review" → status changes to IN-REVIEW
4. Click "Submit Review" → status changes to REVIEWED
5. No more actions available (waiting for Manager)

### Scenario 3: Manager Workflow
1. Login as Manager
2. See job with status REVIEWED
3. Click "Complete" → status changes to COMPLETED
4. Can also Edit or Delete any job
5. Can manually change status via dropdown

## Notes

- ⚠️ Employee và QA **KHÔNG** thể chỉnh sửa status trực tiếp, chỉ thông qua action buttons
- ⚠️ Manager có quyền cao nhất, có thể override status nếu cần
- ⚠️ Workflow là một chiều, không có nút "quay lại" (trừ khi Manager can thiệp)
- ✅ Mỗi action đều có validation để đảm bảo status transition đúng
- ✅ Toast notification xuất hiện sau mỗi action thành công
- ✅ Console log để debug và tracking
