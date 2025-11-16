# Job Management - Filtering & Pagination Guide

## 📋 Overview

Hệ thống quản lý công việc hiện đã được tích hợp đầy đủ tính năng **Filtering** và **Pagination** để giúp người dùng dễ dàng tìm kiếm và quản lý công việc.

---

## 🎯 Features

### 1. **Filter Bar** (Thanh Bộ Lọc)

Bộ lọc gồm 5 tiêu chí:

#### **Date Range Filter**
- **From Date**: Lọc công việc từ ngày bắt đầu
- **To Date**: Lọc công việc đến ngày kết thúc
- Sử dụng HTML5 date input

#### **Job Status Filter**
- All Status (mặc định)
- Pending
- In Progress
- Done
- In Review
- Reviewed
- Completed

#### **Payment Status Filter**
- All Payment (mặc định)
- Unpaid
- Partial
- Paid

#### **Search Filter**
- Tìm kiếm theo:
  - Customer Name (Tên khách hàng)
  - Assigned Employee (Nhân viên phụ trách)
  - QA (Người QA)
- Case-insensitive search

#### **Action Buttons**
- **Apply**: Áp dụng bộ lọc
- **Reset**: Reset tất cả bộ lọc về mặc định

---

### 2. **Pagination** (Phân Trang)

#### **Controls**
- **Items per page**: Chọn số lượng items hiển thị (10, 20, 50, 100)
- **Page info**: Hiển thị "Showing X-Y of Z items"
- **Navigation buttons**:
  - First page (⏮️)
  - Previous page (◀️)
  - Current page / Total pages
  - Next page (▶️)
  - Last page (⏭️)

#### **Smart Pagination**
- Tự động cập nhật khi filter thay đổi
- Reset về trang 1 khi apply filters
- Disable buttons khi ở trang đầu/cuối

---

## 🔧 Technical Implementation

### Type Definitions (`/src/types/jobs.tsx`)

```typescript
// Filter interface
export interface JobFilters {
  fromDate: string
  toDate: string
  jobStatus: JobStatus | "all"
  paymentStatus: PaymentStatus | "all"
  search: string // Search by email or fullname
}

// Pagination interface
export interface Pagination {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}
```

### Components

#### **FilterBar** (`/src/components/jobs/filter-bar.tsx`)
```typescript
interface FilterBarProps {
  filters: JobFilters
  onFilterChange: (filters: JobFilters) => void
  onApply: () => void
  onReset: () => void
}
```

**Features:**
- Responsive grid layout (6 columns on xl screens)
- Date inputs for range selection
- Select dropdowns for status filters
- Search input with icon
- Apply and Reset buttons

#### **Pagination** (`/src/components/jobs/pagination.tsx`)
```typescript
interface PaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}
```

**Features:**
- Items per page selector
- Page range display
- Navigation buttons with icons
- Disabled states for boundary pages

---

## 💡 Usage in Page

### State Management

```typescript
// Filter state (UI state)
const [filters, setFilters] = useState<JobFilters>({
  fromDate: "",
  toDate: "",
  jobStatus: "all",
  paymentStatus: "all",
  search: "",
})

// Applied filters (actual filtering)
const [appliedFilters, setAppliedFilters] = useState<JobFilters>(filters)

// Pagination state
const [pagination, setPagination] = useState<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
})
```

### Filtering Logic

```typescript
const filteredAndPaginatedJobs = useMemo(() => {
  // 1. Filter jobs by all criteria
  const filtered = jobs.filter((job) => {
    // Date range
    if (appliedFilters.fromDate && job.date < appliedFilters.fromDate) return false
    if (appliedFilters.toDate && job.date > appliedFilters.toDate) return false
    
    // Status filters
    if (appliedFilters.jobStatus !== "all" && job.jobStatus !== appliedFilters.jobStatus) return false
    if (appliedFilters.paymentStatus !== "all" && job.paymentStatus !== appliedFilters.paymentStatus) return false
    
    // Search
    if (appliedFilters.search) {
      const searchLower = appliedFilters.search.toLowerCase()
      const match = 
        job.customerName.toLowerCase().includes(searchLower) ||
        job.assignedEmployee.toLowerCase().includes(searchLower) ||
        job.qa.toLowerCase().includes(searchLower)
      if (!match) return false
    }
    
    return true
  })

  // 2. Update pagination metadata
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pagination.pageSize)
  setPagination(prev => ({ ...prev, totalItems, totalPages }))

  // 3. Apply pagination
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
}, [jobs, appliedFilters, pagination.currentPage, pagination.pageSize])
```

### Event Handlers

```typescript
// Apply filters
const handleApplyFilters = () => {
  setAppliedFilters(filters)
  setPagination(prev => ({ ...prev, currentPage: 1 }))
}

// Reset filters
const handleResetFilters = () => {
  const resetFilters: JobFilters = {
    fromDate: "",
    toDate: "",
    jobStatus: "all",
    paymentStatus: "all",
    search: "",
  }
  setFilters(resetFilters)
  setAppliedFilters(resetFilters)
  setPagination(prev => ({ ...prev, currentPage: 1 }))
}

// Change page
const handlePageChange = (page: number) => {
  setPagination(prev => ({ ...prev, currentPage: page }))
}

// Change page size
const handlePageSizeChange = (pageSize: number) => {
  setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }))
}
```

---

## 🎨 UI Integration

```tsx
<div className="flex flex-col gap-6">
  {/* Header & Stats */}
  
  {/* Filter Bar */}
  <FilterBar
    filters={filters}
    onFilterChange={setFilters}
    onApply={handleApplyFilters}
    onReset={handleResetFilters}
  />

  {/* Job Table */}
  <JobTable
    jobs={filteredAndPaginatedJobs}
    {/* ... other props */}
  />

  {/* Pagination */}
  <Pagination
    pagination={pagination}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
  />
</div>
```

---

## 📊 Statistics Display

Stats đã được cập nhật để hiển thị:
- **Total Jobs**: Số lượng jobs sau khi filter (`pagination.totalItems`)
- Hiển thị "X of Y total" để người dùng biết tổng số jobs
- **In Progress** và **Completed**: Vẫn hiển thị từ toàn bộ jobs (không filter)

```tsx
<div className="text-2xl font-bold mt-1">{pagination.totalItems}</div>
<p className="text-xs text-muted-foreground mt-1">
  of {jobs.length} total
</p>
```

---

## 🔄 User Flow

### Scenario 1: Filter by Date Range
1. User chọn **From Date**: `2025-01-10`
2. User chọn **To Date**: `2025-01-20`
3. User click **Apply**
4. Hệ thống hiển thị jobs trong khoảng thời gian đó
5. Pagination reset về trang 1

### Scenario 2: Search by Name
1. User nhập "John" vào search box
2. User click **Apply**
3. Hệ thống hiển thị tất cả jobs có:
   - Customer name chứa "John"
   - Assigned employee chứa "John"
   - QA chứa "John"

### Scenario 3: Multiple Filters
1. User chọn **Job Status**: `In Progress`
2. User chọn **Payment Status**: `Paid`
3. User nhập search: `ABC`
4. User click **Apply**
5. Hệ thống hiển thị jobs thỏa mãn TẤT CẢ điều kiện (AND logic)

### Scenario 4: Reset Filters
1. User đã apply nhiều filters
2. User click **Reset**
3. Tất cả filters về trạng thái mặc định
4. Table hiển thị tất cả jobs
5. Pagination reset về trang 1

### Scenario 5: Change Page Size
1. User đang xem trang 3 với 10 items/page
2. User thay đổi thành 20 items/page
3. Pagination tự động reset về trang 1
4. Table hiển thị 20 items đầu tiên

---

## 🚀 Future Enhancements

### Phase 1: Backend Integration
```typescript
// TODO: Call API with filters and pagination
const fetchJobs = async () => {
  const response = await axios.get('/api/jobs', {
    params: {
      fromDate: appliedFilters.fromDate,
      toDate: appliedFilters.toDate,
      jobStatus: appliedFilters.jobStatus,
      paymentStatus: appliedFilters.paymentStatus,
      search: appliedFilters.search,
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    }
  })
  
  setJobs(response.data.jobs)
  setPagination(response.data.pagination)
}
```

### Phase 2: Advanced Features
- **Save Filters**: Lưu bộ lọc thường dùng
- **Export Filtered Data**: Export Excel/CSV với filters
- **Sort**: Sắp xếp theo các columns
- **Multi-select**: Filter theo nhiều status cùng lúc
- **Date Presets**: Quick select (Today, This Week, This Month)

### Phase 3: Performance
- **Debounce Search**: Delay search khi user đang typing
- **Lazy Loading**: Load data khi scroll
- **Cache Filters**: Cache filters trong localStorage

---

## 🐛 Testing Checklist

### Filter Testing
- ✅ Date range: fromDate only
- ✅ Date range: toDate only
- ✅ Date range: both dates
- ✅ Job status filter: each status
- ✅ Payment status filter: each status
- ✅ Search: customer name
- ✅ Search: employee name
- ✅ Search: QA name
- ✅ Multiple filters combined
- ✅ Reset button clears all filters

### Pagination Testing
- ✅ Change page: next, previous
- ✅ Change page: first, last
- ✅ Change page size: 10, 20, 50, 100
- ✅ Boundary conditions: page 1, last page
- ✅ Empty results
- ✅ Single page results
- ✅ Navigation buttons disabled states

### Integration Testing
- ✅ Filter + Pagination work together
- ✅ Stats update correctly
- ✅ Reset filters resets pagination
- ✅ Change page size resets to page 1
- ✅ Table displays correct filtered data

---

## 📝 Notes

1. **Two-stage Filtering**: `filters` vs `appliedFilters`
   - `filters`: UI state (người dùng đang chọn)
   - `appliedFilters`: Actual filtering (áp dụng sau khi click Apply)
   - Lý do: Tránh re-render liên tục khi user đang select

2. **Pagination Reset Logic**:
   - Reset về page 1 khi: Apply filters, Reset filters, Change page size
   - Không reset khi: Chỉ navigate giữa các trang

3. **Search Behavior**:
   - Case-insensitive
   - Partial match (includes)
   - Search trong 3 fields: customerName, assignedEmployee, qa

4. **Responsive Design**:
   - FilterBar: 6 columns trên xl screens, tự động collapse trên mobile
   - Pagination: Stack vertically trên mobile

---

## 🎓 Best Practices

1. **Always use Apply button**: Không filter ngay khi user đang typing/selecting
2. **Show feedback**: Display "X of Y total" để user biết bao nhiêu items được filter
3. **Preserve user intent**: Pagination state được maintain khi không có filter changes
4. **Disable smartly**: Disable navigation buttons ở boundaries
5. **Clear communication**: Labels và placeholders rõ ràng

---

**Created**: 2025-01-25  
**Last Updated**: 2025-01-25  
**Version**: 1.0.0
