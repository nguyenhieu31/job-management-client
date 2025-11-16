# Payroll Management Feature Guide

## Overview

The Payroll Management system allows managers to generate, review, approve, and track employee salaries based on completed and reviewed jobs. This feature is **Manager-only** and organized by payroll periods (monthly).

## Feature Architecture

### 1. **Data Types** (`src/types/payroll.tsx`)

```typescript
PayrollStatus: "PENDING" | "APPROVED" | "PAID" | "REJECTED"

PayrollItem: {
  jobId: number
  jobCode: string
  caseName: string
  completedDate: Date
  amount: number
}

EmployeePayroll: {
  id: number
  payrollPeriod: "YYYY-MM"
  employeeId: number
  employeeName: string
  items: PayrollItem[]
  subtotal: number
  deductions: number
  bonus: number
  total: number
  status: PayrollStatus
  approvalDate?: Date
  paidDate?: Date
}
```

### 2. **API Service** (`src/services/PayrollApi.tsx`)

10 endpoints for payroll operations:
- `getPayrollByPeriod(period, page, pageSize)` - List payroll
- `getEmployeePayroll(employeeId, period)` - Single employee
- `generatePayroll(period, employeeIds?)` - Create for period
- `approvePayroll(id)` - Manager approval
- `rejectPayroll(id, reason)` - Rejection with reason
- `markAsPaid(id)` - Mark as paid
- `getSummary(period)` - Period statistics
- `getPeriods()` - Available periods
- `updatePayroll(id, data)` - Bonus/deductions
- `exportPayroll(period)` - Export to Excel

### 3. **Redux State** (`src/store/slice/payroll/Payroll.tsx`)

**State Structure:**
```typescript
{
  payrolls: EmployeePayroll[]
  currentPayroll: EmployeePayroll | null
  summary: PayrollSummary | null
  loading: boolean
  error: string | null
  selectedPeriod: string | null
  periods: string[]
}
```

**Async Thunks:**
- `fetchPayrollByPeriod` - Load payroll list
- `fetchPayrollSummary` - Load statistics
- `generatePayroll` - Generate new payroll
- `approvePayroll` - Approve payroll
- `markPayrollAsPaid` - Mark as paid
- `fetchPayrollPeriods` - Load available periods

### 4. **UI Components**

#### `PayrollTable` (`src/components/payroll/payroll-table.tsx`)
- Displays payroll list with columns:
  - Employee name
  - Period
  - Total amount
  - Status (badge with color)
  - Actions (View, Approve, Reject, Mark Paid)
- Status-based actions show conditionally:
  - **PENDING**: Show Approve & Reject buttons
  - **APPROVED**: Show Mark Paid button
  - **PAID**: No action buttons
  - **REJECTED**: No action buttons

#### `PayrollDetailDialog` (`src/components/payroll/payroll-detail-dialog.tsx`)
- Shows complete payroll details:
  - Employee information
  - Job items table with:
    - Job code
    - Case name
    - Completion date
    - Amount
  - Financial breakdown:
    - Subtotal (sum of jobs)
    - Deductions (negative)
    - Bonus (positive)
    - Total
  - Status and approval dates

#### `PayrollActionDialog` (`src/components/payroll/payroll-action-dialog.tsx`)
- Handles approve, reject, and mark-paid actions
- **For rejection**: Requires reason explanation
- Color-coded buttons:
  - Green for Approve
  - Red for Reject
  - Blue for Mark Paid

#### `PayrollPage` (`src/app/dashboard/payroll/page.tsx`)
- Main payroll dashboard:
  - Period selector (dropdown)
  - Refresh button
  - Summary statistics:
    - Total employees
    - Total amount
    - Approved count
    - Paid count
  - Payroll table integration
  - Loading states

## Data Flow

### Generate Payroll
```
Manager clicks Generate
→ fetchPayrollByPeriod dispatched
→ API returns jobs by period grouped by employee
→ Payroll list displayed with PENDING status
```

### Approve Payroll
```
Manager clicks Approve button
→ PayrollActionDialog opens
→ Manager confirms
→ approvePayroll thunk dispatched
→ Status changes to APPROVED
→ Table refreshes
```

### Mark as Paid
```
Manager clicks "Mark Paid" button
→ PayrollActionDialog opens
→ Manager confirms
→ markPayrollAsPaid thunk dispatched
→ Status changes to PAID
→ Paid date recorded
→ Table refreshes
```

### Reject Payroll
```
Manager clicks Reject button
→ PayrollActionDialog opens with reason field
→ Manager enters reason and confirms
→ rejectPayroll thunk dispatched (when backend ready)
→ Status changes to REJECTED
→ Reason stored for reference
```

## Period Format

Payroll periods use **ISO format**: `YYYY-MM`

Examples:
- `2024-10` - October 2024
- `2024-11` - November 2024
- `2024-12` - December 2024

## Role-Based Access

**Manager Only:**
- View payroll page (added to sidebar as "Bảng Lương")
- Generate payroll for period
- Approve payroll
- Reject payroll with reason
- Mark payroll as paid
- View summary statistics

**Employees/QA:**
- No access to payroll page

## Navigation Integration

Added to sidebar (`src/components/dashboard/sidebar.tsx`):
- Icon: `DollarSign` (lucide-react)
- Label: "Bảng Lương"
- Route: `/dashboard/payroll`
- Visible to: Managers only

## Store Integration

Updated `src/store/store.tsx`:
- Added `payroll: PayrollSlice` to reducer configuration

## Summary Statistics (`PayrollSummary`)

```typescript
{
  totalEmployees: number
  totalAmount: number
  approvedCount: number
  paidCount: number
  pendingCount: number
  rejectedCount: number
  averagePayroll: number
}
```

Displayed on main page in 4-column grid:
- Total Employees
- Total Amount (formatted currency)
- Approved Count (blue)
- Paid Count (green)

## Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| PENDING | Yellow | #fbbf24 |
| APPROVED | Blue | #3b82f6 |
| PAID | Green | #22c55e |
| REJECTED | Red | #ef4444 |

## Currency Formatting

All amounts display in Vietnamese Dong (VND):
```typescript
new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
}).format(amount)
```

Example: `100,000 ₫` or `5,000,000 ₫`

## Date Formatting

All dates display in Vietnamese format:
```typescript
new Date(date).toLocaleDateString("vi-VN")
```

Example: `12/10/2024` (DD/MM/YYYY)

## Backend Integration Ready

All endpoints are defined in `PayrollApi.tsx` with proper error handling:
- Expected request/response formats documented
- Mock support planned with `NEXT_PUBLIC_USE_MOCK_DATA` flag
- Follows same pattern as Invoice and Job systems

## Future Enhancements

1. **Mock Data Support** - Add payroll mock data when `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. **Batch Operations** - Select multiple payrolls for approval
3. **Export Feature** - Export to Excel/PDF
4. **Payroll History** - View previous periods
5. **Deduction/Bonus Management** - UI for adding/editing deductions and bonuses
6. **Notes** - Add manager notes to payroll
7. **Notifications** - Alert on payroll state changes

## File Locations

```
📁 Payroll Feature Files
├── 📄 src/types/payroll.tsx - Type definitions
├── 📄 src/services/PayrollApi.tsx - API endpoints
├── 📄 src/store/slice/payroll/Payroll.tsx - Redux logic
├── 📄 src/components/payroll/payroll-table.tsx - Table display
├── 📄 src/components/payroll/payroll-detail-dialog.tsx - Detail view
├── 📄 src/components/payroll/payroll-action-dialog.tsx - Actions
└── 📄 src/app/dashboard/payroll/page.tsx - Main page
```

## Testing Checklist

- [ ] Navigate to Bảng Lương (payroll menu item visible for managers)
- [ ] Select period from dropdown
- [ ] View payroll list with employees
- [ ] Click "Xem Chi Tiết" (View Details) to open detail dialog
- [ ] Click "Duyệt" (Approve) - dialog opens and confirms
- [ ] Click "Từ Chối" (Reject) - dialog shows reason field
- [ ] Click "Đã Thanh Toán" (Mark Paid) - dialog confirms and marks as paid
- [ ] Verify status colors update correctly
- [ ] Verify currency/date formatting
- [ ] Verify summary statistics update
- [ ] Test responsive design on mobile

## Notes

- All timestamps handled as Dates locally, strings from API
- Decimal formatting handles both string and Date parameters
- Toast notifications use react-toastify pattern
- Follows established patterns from Invoice & Customer systems
- Manager-only visibility enforced at Redux filter level
