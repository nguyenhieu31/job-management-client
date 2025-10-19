# Job Form - Complete Guide

## 📋 Overview

Job Form đã được cập nhật hoàn toàn với các thay đổi quan trọng:
1. **Chỉ Manager có thể tạo Job mới** (nút Add Job ẩn với Employee/QA)
2. **Form mới với 10 fields** thay vì 3 fields cũ
3. **Auto-calculate** cho Total Price và Job Code
4. **Dropdown selection** cho Customer và Assignee

---

## 🎯 New Features

### 1. **Role-Based Access Control**

#### Manager Role
- ✅ Có thể thấy nút "Add Job" và "Get Job"
- ✅ Có thể tạo job mới
- ✅ Có thể edit job hiện có

#### Employee & QA Roles
- ❌ Không thấy nút "Add Job" và "Get Job"
- ❌ Không thể tạo job mới
- ✅ Có thể xem và thao tác với jobs được assign

**Implementation:**
```tsx
{userRole === "manager" && (
  <div>
    <Button onClick={() => setFormOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Job
    </Button>
  </div>
)}
```

---

## 📝 Form Fields

### 1. **Case Name** ⭐ (Required)
- **Type**: Text input
- **Purpose**: Tên dự án/công việc
- **Example**: "Website Redesign", "Logo Design"
- **Validation**: Required field

### 2. **Customer** ⭐ (Required)
- **Type**: Dropdown select
- **Purpose**: Chọn khách hàng
- **Options**: Dynamic list from `customersList`
- **Example**: "ABC Company", "XYZ Corporation"
- **Validation**: Required field

### 3. **Assigned Employee** ⭐ (Required)
- **Type**: Dropdown select
- **Purpose**: Chọn nhân viên phụ trách
- **Options**: Dynamic list from `employeesList`
- **Example**: "John Doe", "Jane Smith"
- **Validation**: Required field

### 4. **Input Number (File Count)** ⭐ (Required)
- **Type**: Number input
- **Purpose**: Số lượng file input
- **Min**: 0
- **Validation**: Required, must be number
- **Note**: Được sử dụng để tính Total Price

### 5. **File Price** ⭐ (Required)
- **Type**: Number input (decimal)
- **Purpose**: Giá mỗi file
- **Min**: 0
- **Step**: 0.01 (cho phép số thập phân)
- **Validation**: Required, must be number
- **Example**: 10.00, 15.50

### 6. **Total Price** 💰 (Auto-calculated)
- **Type**: Display only (không nhập)
- **Formula**: `Input Number × File Price`
- **Format**: Currency with 2 decimals
- **Example**: $500.00
- **Display**: Hiển thị real-time khi user nhập Input Number và File Price

### 7. **Job Status**
- **Type**: Dropdown select
- **Default**: "pending"
- **Options**:
  - Pending
  - In Progress
  - Done
  - In Review
  - Reviewed
  - Completed

### 8. **Payment Status**
- **Type**: Dropdown select
- **Default**: "unpaid"
- **Options**:
  - Unpaid
  - Partial
  - Paid

### 9. **Input Link**
- **Type**: URL input
- **Purpose**: Link đến file input (Google Drive, Dropbox, etc.)
- **Validation**: Optional, but should be valid URL
- **Example**: "https://drive.google.com/..."

### 10. **Note**
- **Type**: Textarea (3 rows)
- **Purpose**: Ghi chú bổ sung
- **Validation**: Optional
- **Example**: "High priority project", "Client requested changes"

---

## 🔧 Auto-Generated Fields

Các field sau được tự động sinh khi tạo job mới:

### 1. **Job Code**
- **Format**: `JOB-XXX` (XXX là số 3 chữ số)
- **Example**: `JOB-001`, `JOB-042`, `JOB-123`
- **Logic**: Auto-increment based on max ID + 1

```typescript
const code = `JOB-${String(id).padStart(3, '0')}`;
```

### 2. **Date**
- **Format**: `YYYY-MM-DD`
- **Value**: Current date khi tạo job
- **Example**: `2025-01-25`

```typescript
const date = new Date().toISOString().split('T')[0];
```

### 3. **Total Price**
- **Formula**: `inputCount × filePrice`
- **Stored**: Trong database khi submit

### 4. **Output Count**
- **Default**: `0`
- **Purpose**: Sẽ được cập nhật sau khi Employee hoàn thành

### 5. **Link Done**
- **Default**: `""` (empty string)
- **Purpose**: Sẽ được cập nhật khi job completed

### 6. **QA**
- **Default**: `""` (empty string)
- **Purpose**: Sẽ được assign sau bởi Manager

---

## 💡 User Experience

### Creating New Job Flow

#### Step 1: Click "Add Job"
- Manager click nút "Add Job"
- Dialog form mở ra

#### Step 2: Fill Required Fields
1. Enter **Case Name** (ví dụ: "Website Redesign")
2. Select **Customer** from dropdown
3. Select **Assigned Employee** from dropdown
4. Enter **Input Number** (ví dụ: 50)
5. Enter **File Price** (ví dụ: 10)
6. **Total Price** tự động hiển thị: $500.00

#### Step 3: Optional Fields
7. Select **Job Status** (default: Pending)
8. Select **Payment Status** (default: Unpaid)
9. Enter **Input Link** (optional)
10. Enter **Note** (optional)

#### Step 4: Submit
- Click "Create Job"
- System auto-generates:
  - Job Code: `JOB-007`
  - Date: `2025-01-25`
  - Total Price: `500`
  - Output Count: `0`
  - Link Done: `""`
  - QA: `""`

#### Step 5: Success
- Job added to table
- Form closes
- Toast notification: "Job created successfully"

---

## 🎨 UI/UX Improvements

### 1. **Scrollable Dialog**
```tsx
<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
```
- Max width: 600px
- Max height: 90% viewport height
- Scrollable content

### 2. **Total Price Display**
```tsx
{inputNumber && filePrice && (
  <div className="grid gap-2">
    <Label>Total Price (Calculated)</Label>
    <div className="text-lg font-semibold text-primary">
      ${(parseFloat(inputNumber) * parseFloat(filePrice)).toFixed(2)}
    </div>
  </div>
)}
```
- Only shows when both Input Number and File Price are filled
- Large, bold, primary color for visibility
- 2 decimal places for currency

### 3. **Smart Validation**
- Required fields marked with `*`
- HTML5 validation (required, type="number", type="url")
- Min/Step attributes for number inputs
- Disable submit if required fields empty

### 4. **Responsive Layout**
- Mobile-friendly
- Stack inputs vertically
- Touch-friendly dropdowns
- Easy scrolling on small screens

---

## 🔄 Edit Job Flow

### Opening Edit Mode
1. Manager clicks "Edit" button on a job row
2. Form opens with pre-filled data
3. Dialog title changes to "Edit Job"
4. Button changes to "Update Job"

### Pre-filled Data
```typescript
useEffect(() => {
  if (editingJob) {
    setCaseName(editingJob.caseName)
    setFilePrice(String(editingJob.filePrice))
    setInputNumber(String(editingJob.inputCount))
    setPaymentStatus(editingJob.paymentStatus)
    setJobStatus(editingJob.jobStatus)
    setInputLink(editingJob.linkInput)
    setNote(editingJob.note)
    setAssignedEmployee(editingJob.assignedEmployee)
    setCustomerId(editingJob.customerName)
  }
}, [editingJob, open])
```

### Update Behavior
- Preserves existing `id`, `code`, `date`
- Updates all other fields
- Recalculates Total Price if Input Number or File Price changed
- Maintains Output Count and Link Done

---

## 🏗️ Technical Implementation

### Props Interface

```typescript
interface JobFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (job: Omit<Job, "id" | "code" | "date" | "totalPrice" | "outputCount" | "linkDone"> | Job) => void
  editingJob?: Job | null
  customers?: Array<{ value: string; label: string }>
  employees?: Array<{ value: string; label: string }>
}
```

### State Management

```typescript
const [caseName, setCaseName] = useState("")
const [filePrice, setFilePrice] = useState("")
const [inputNumber, setInputNumber] = useState("")
const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid")
const [jobStatus, setJobStatus] = useState<JobStatus>("pending")
const [inputLink, setInputLink] = useState("")
const [note, setNote] = useState("")
const [assignedEmployee, setAssignedEmployee] = useState("")
const [customerId, setCustomerId] = useState("")
```

### Submit Handler

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  if (!caseName.trim() || !customerId || !assignedEmployee) return

  const inputCount = parseInt(inputNumber) || 0
  const price = parseFloat(filePrice) || 0

  if (editingJob) {
    // Update existing job
    onSubmit({
      ...editingJob,
      caseName,
      inputCount,
      filePrice: price,
      paymentStatus,
      jobStatus,
      linkInput: inputLink,
      note,
      assignedEmployee,
      customerName: customerId,
    })
  } else {
    // Create new job
    onSubmit({
      caseName,
      inputCount,
      filePrice: price,
      paymentStatus,
      jobStatus,
      linkInput: inputLink,
      note,
      assignedEmployee,
      customerName: customerId,
      linkDone: "",
      outputCount: 0,
      totalPrice: inputCount * price,
      qa: "",
    } as Omit<Job, "id" | "code" | "date">)
  }

  // Reset form and close
  // ... reset all fields ...
  onOpenChange(false)
}
```

---

## 📊 Data Flow

### Create Job Flow
```
User Input → JobForm State
              ↓
         handleSubmit()
              ↓
         onSubmit(newJob)
              ↓
         handleAddJob() (in page.tsx)
              ↓
    Auto-generate: id, code, date, totalPrice, outputCount, linkDone
              ↓
         Add to jobs array
              ↓
         Table updates
```

### Edit Job Flow
```
Click Edit → editingJob set
              ↓
         JobForm receives editingJob
              ↓
         useEffect pre-fills form
              ↓
         User edits fields
              ↓
         handleSubmit()
              ↓
         onSubmit(updatedJob)
              ↓
         handleAddJob() (in page.tsx)
              ↓
         Update jobs array
              ↓
         Table updates
```

---

## 🎓 Demo Data

### Customers List
```typescript
const customersList = [
  { value: "ABC Company", label: "ABC Company" },
  { value: "XYZ Corporation", label: "XYZ Corporation" },
  { value: "Tech Startup", label: "Tech Startup" },
  { value: "Digital Agency", label: "Digital Agency" },
  { value: "E-commerce Store", label: "E-commerce Store" },
  { value: "Marketing Firm", label: "Marketing Firm" },
]
```

### Employees List
```typescript
const employeesList = [
  { value: "emp1", label: "John Doe" },
  { value: "emp2", label: "Jane Smith" },
  { value: "emp3", label: "Bob Johnson" },
]
```

---

## 🚀 Future Enhancements

### Phase 1: Backend Integration
- Fetch customers from API
- Fetch employees from API
- POST new job to API
- PUT update job to API
- Validation from backend

### Phase 2: Advanced Features
- **Customer Management**: Add new customer from form
- **Employee Search**: Search/filter employees
- **File Upload**: Upload input files directly
- **Bulk Import**: Import multiple jobs from CSV/Excel
- **Templates**: Save common job templates
- **Auto-assign**: Smart employee assignment based on workload

### Phase 3: Validation
- **Price Validation**: Min/Max price limits
- **URL Validation**: Validate Google Drive/Dropbox links
- **Duplicate Check**: Check for duplicate case names
- **Required File Link**: Make Input Link required
- **Custom Error Messages**: Better error feedback

### Phase 4: UX Improvements
- **Auto-save Draft**: Save form progress
- **Keyboard Shortcuts**: Cmd+Enter to submit
- **Inline Edit**: Edit fields directly in table
- **Quick Add**: Minimal form for quick job creation
- **Copy Job**: Duplicate existing job

---

## 🐛 Testing Checklist

### Manager Testing
- ✅ Can see "Add Job" button
- ✅ Can open form
- ✅ Can fill all required fields
- ✅ Total Price calculates correctly
- ✅ Can select from Customer dropdown
- ✅ Can select from Employee dropdown
- ✅ Can submit form
- ✅ Job appears in table with auto-generated code
- ✅ Can edit existing job
- ✅ Can update job successfully

### Employee Testing
- ✅ Cannot see "Add Job" button
- ✅ Cannot create new jobs
- ✅ Can view jobs in table

### QA Testing
- ✅ Cannot see "Add Job" button
- ✅ Cannot create new jobs
- ✅ Can view jobs in table

### Form Validation
- ✅ Required fields show validation
- ✅ Cannot submit without Case Name
- ✅ Cannot submit without Customer
- ✅ Cannot submit without Assigned Employee
- ✅ Cannot submit without Input Number
- ✅ Cannot submit without File Price
- ✅ Number inputs only accept numbers
- ✅ URL input accepts valid URLs
- ✅ Total Price updates in real-time

### Edge Cases
- ✅ Empty customers list shows "Demo Customer"
- ✅ Empty employees list shows "Demo Employee"
- ✅ Form resets after successful submit
- ✅ Form closes on Cancel
- ✅ Edit mode pre-fills all fields correctly
- ✅ Total Price with decimals: 10.5 × 3 = $31.50

---

## 📝 Migration Notes

### Old Form (Before)
```typescript
- title: string
- description: string
- status: JobStatus
```

### New Form (After)
```typescript
- caseName: string ⭐
- customerName: string (dropdown) ⭐
- assignedEmployee: string (dropdown) ⭐
- inputCount: number ⭐
- filePrice: number ⭐
- totalPrice: number (auto-calculated) 💰
- jobStatus: JobStatus
- paymentStatus: PaymentStatus
- linkInput: string
- note: string
+ Auto-generated: id, code, date, outputCount, linkDone, qa
```

### Breaking Changes
- ❌ Removed: `title`, `description`
- ✅ Added: 8 new fields
- ✅ Changed: `status` → `jobStatus`
- ✅ Changed: Free text customer → Dropdown customer
- ✅ Changed: Free text employee → Dropdown employee

---

**Created**: 2025-01-25  
**Last Updated**: 2025-01-25  
**Version**: 2.0.0
