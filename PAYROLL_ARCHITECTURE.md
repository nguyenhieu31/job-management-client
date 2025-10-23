# Payroll System - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAYROLL SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         src/app/dashboard/payroll/page.tsx              │  │
│  │              (PayrollPage Component)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Period Selector                                       │  │
│  │  • Summary Statistics (4-column grid)                    │  │
│  │  • Loading/Empty States                                  │  │
│  │  • Integrates PayrollTable                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                                    ↓                 │
│  ┌─────────────────────────┐      ┌──────────────────────┐    │
│  │   PayrollTable          │      │  PayrollDetailDialog │    │
│  ├─────────────────────────┤      ├──────────────────────┤    │
│  │ • Employee List         │      │ • Job breakdown      │    │
│  │ • Status Badges         │      │ • Financial Summary  │    │
│  │ • Action Buttons        │      │ • Status Info        │    │
│  │ • Pagination Ready      │      │ • Date Display       │    │
│  └─────────────────────────┘      └──────────────────────┘    │
│           ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PayrollActionDialog                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Approve Action (simple confirm)                       │  │
│  │  • Reject Action (with reason field)                     │  │
│  │  • Mark Paid Action (simple confirm)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│           Redux Store (src/store/store.tsx)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Payroll Slice (src/store/slice/payroll/Payroll.tsx)   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  State:                                                  │  │
│  │  ├─ payrolls[]                  (current records)       │  │
│  │  ├─ selectedPeriod              (active period filter)  │  │
│  │  ├─ periods[]                   (available periods)     │  │
│  │  ├─ summary                     (statistics)            │  │
│  │  ├─ currentPayroll              (selected record)       │  │
│  │  ├─ loading: boolean            (async state)           │  │
│  │  └─ error: string | null        (error state)           │  │
│  │                                                           │  │
│  │  Thunks (Async Actions):                                │  │
│  │  ├─ fetchPayrollByPeriod  ──→  API call + store         │  │
│  │  ├─ fetchPayrollSummary   ──→  API call + store         │  │
│  │  ├─ fetchPayrollPeriods   ──→  API call + store         │  │
│  │  ├─ approvePayroll        ──→  API call + refresh       │  │
│  │  ├─ markPayrollAsPaid     ──→  API call + refresh       │  │
│  │  └─ (rejectPayroll)       ──→  API call when ready      │  │
│  │                                                           │  │
│  │  Actions (Sync):                                        │  │
│  │  ├─ setSelectedPeriod()  (update filter)                │  │
│  │  └─ clearError()         (reset error state)            │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PayrollApi (src/services/PayrollApi.tsx)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Endpoints (10 methods)                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  GET /admin/payroll/{period}?page&pageSize              │  │
│  │    ↳ getPayrollByPeriod()  → List payroll               │  │
│  │                                                           │  │
│  │  GET /admin/payroll/{period}/summary                    │  │
│  │    ↳ getSummary()  → Statistics                         │  │
│  │                                                           │  │
│  │  GET /admin/payroll/periods                             │  │
│  │    ↳ getPeriods()  → Available periods                  │  │
│  │                                                           │  │
│  │  GET /admin/payroll/employee/{empId}/{period}           │  │
│  │    ↳ getEmployeePayroll()  → Single employee            │  │
│  │                                                           │  │
│  │  POST /admin/payroll/generate/{period}                  │  │
│  │    ↳ generatePayroll()  → Create for period             │  │
│  │                                                           │  │
│  │  PUT /admin/payroll/{id}/approve                        │  │
│  │    ↳ approvePayroll()  → Approve status                 │  │
│  │                                                           │  │
│  │  PUT /admin/payroll/{id}/reject                         │  │
│  │    ↳ rejectPayroll()  → Reject with reason              │  │
│  │                                                           │  │
│  │  PUT /admin/payroll/{id}/mark-paid                      │  │
│  │    ↳ markAsPaid()  → Mark as paid                       │  │
│  │                                                           │  │
│  │  PUT /admin/payroll/{id}                                │  │
│  │    ↳ updatePayroll()  → Update details                  │  │
│  │                                                           │  │
│  │  GET /admin/payroll/{period}/export                     │  │
│  │    ↳ exportPayroll()  → Export to file                  │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Uses: axiosInstance with error handling                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Not Yet Implemented)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Database                                                       │
│  ├─ Payroll records                                            │
│  ├─ Employee payroll items                                     │
│  ├─ Approval history                                           │
│  └─ Payment tracking                                           │
│                                                                   │
│  Business Logic                                                 │
│  ├─ Calculate payroll (job amounts)                            │
│  ├─ Apply deductions                                           │
│  ├─ Add bonuses                                                │
│  ├─ Approval workflow                                          │
│  └─ Payment processing                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│  Manager UI  │ (Manager navigates to Bảng Lương)
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Sidebar Navigation      │
│  (/dashboard/payroll)    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  PayrollPage Component   │
│  (useEffect on mount)    │
└──────┬───────────────────┘
       │
       ├─→ dispatch(fetchPayrollPeriods())
       │        ↓
       │   PayrollApi.getPeriods()
       │        ↓
       │   Redux: periods[] ← [2024-10, 2024-11, ...]
       │        ↓
       │   Period Dropdown populated
       │
       └─→ Waiting for period selection
           
           Manager selects period (2024-10)
           │
           ▼
       dispatch(setSelectedPeriod("2024-10"))
       Redux: selectedPeriod = "2024-10"
           │
           ├─→ dispatch(fetchPayrollByPeriod())
           │        ↓
           │   PayrollApi.getPayrollByPeriod()
           │        ↓
           │   Redux: payrolls[] ← employee records
           │
           └─→ dispatch(fetchPayrollSummary())
                    ↓
               PayrollApi.getSummary()
                    ↓
               Redux: summary ← {totalEmployees, totalAmount, ...}
                    ↓
               UI Re-renders with data
               
               
       Manager clicks "Xem Chi Tiết" button
       │
       ▼
   PayrollDetailDialog opens (state: selectedPayroll)
       │
       ├─→ Component renders:
       │   • Employee information
       │   • Job items table
       │   • Financial breakdown
       │   • Status and dates
       │
       └─→ Manager clicks close or outside
           Dialog closes
           
           
       Manager clicks "Duyệt" (Approve) button
       │
       ▼
   PayrollActionDialog opens
   (actionType: "approve")
       │
       ├─→ Component shows:
       │   • Confirmation message
       │   • Approve button (green)
       │   • Cancel button
       │
       └─→ Manager confirms
           │
           ▼
       dispatch(approvePayroll(payrollId))
           │
           ├─→ Redux thunk payload: { id, ...action }
           │   
           ├─→ PayrollApi.approvePayroll(id)
           │        ↓
           │   Backend API call:
           │   PUT /admin/payroll/{id}/approve
           │        ↓
           │   Backend updates status to APPROVED
           │        ↓
           │   Returns updated payroll record
           │
           └─→ Redux reducer updates payrolls[]
                    ↓
               payroll.status = "APPROVED"
                    ↓
               Component re-renders
                    ↓
               toast.success("Bảng lương đã được duyệt")
                    ↓
               Dialog closes
                    ↓
               Table refreshes:
               • Status badge changes color (yellow → blue)
               • "Duyệt" button removed
               • "Đã Thanh Toán" button appears
```

## Component Hierarchy

```
App (Next.js)
│
├─ Sidebar (Navigation)
│  └─ Payroll link → /dashboard/payroll
│
└─ Dashboard Layout
   │
   └─ PayrollPage (/dashboard/payroll)
      │
      ├─ Period Selector Card
      │  ├─ Select dropdown (periods[])
      │  └─ Refresh button
      │
      ├─ Statistics Cards (4 columns)
      │  ├─ Total Employees
      │  ├─ Total Amount
      │  ├─ Approved Count
      │  └─ Paid Count
      │
      ├─ PayrollTable
      │  ├─ Table Header (Employee, Period, Amount, Status, Actions)
      │  │
      │  └─ Table Rows (for each payroll)
      │     ├─ Employee name
      │     ├─ Period (YYYY-MM)
      │     ├─ Total (VND formatted)
      │     ├─ Status Badge (color-coded)
      │     └─ Action Buttons
      │        ├─ "Xem Chi Tiết"
      │        ├─ "Duyệt" (if PENDING)
      │        ├─ "Từ Chối" (if PENDING)
      │        └─ "Đã Thanh Toán" (if APPROVED)
      │
      └─ Dialogs (mounted at PayrollTable level)
         │
         ├─ PayrollDetailDialog
         │  ├─ Employee Information Section
         │  ├─ Job Items Table
         │  ├─ Financial Breakdown
         │  └─ Status & Dates
         │
         └─ PayrollActionDialog
            ├─ Confirmation message
            ├─ Input field (if reject)
            ├─ Action buttons
            └─ Loading state
```

## State Flow

```
Component Dispatch
    ↓
Redux Thunk Action
    ↓
    ├─→ Extract Payload
    │       ↓
    │   PayloadCreator Function
    │       ↓
    │   PayrollApi call
    │       ↓
    │   Try/Catch block
    │       ├─ Success: return response.data
    │       └─ Error: return rejectWithValue(error)
    │
    └─→ extraReducers
            ├─ Case pending: set loading = true
            ├─ Case fulfilled: 
            │  • Update state with payload
            │  • Set loading = false
            │  • Clear error
            └─ Case rejected:
               • Set error message
               • Set loading = false
               
Component receives state update
    ↓
useAppSelector hook returns new state
    ↓
Component re-renders
    ↓
UI updates with new data/status
```

## API Request/Response Pattern

```
Request:
{
  method: "PUT",
  url: "/admin/payroll/{id}/approve",
  headers: {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
  }
}

Response Success:
{
  status: 200,
  data: {
    id: 1,
    payrollPeriod: "2024-10",
    employeeName: "Nguyễn Văn A",
    total: 5300000,
    status: "APPROVED",        ← Updated
    approvalDate: "2024-10-22", ← New
    ...
  }
}

Response Error:
{
  status: 400|401|500,
  data: {
    message: "Invalid payroll ID",
    code: "PAYROLL_NOT_FOUND"
  }
}
```

## Redux Action Lifecycle

```
Dispatch Action
    ↓
Action Payload
    ↓
Thunk PayloadCreator runs
    ↓
    ├─→ pending
    │   • loading = true
    │   • error = null
    │
    ├─→ pending complete
    │   API call executes
    │
    ├─→ fulfilled (success)
    │   • loading = false
    │   • data updated
    │   • error = null
    │
    └─→ rejected (error)
        • loading = false
        • error = message
        • state unchanged
        
Component subscribed to state
    ↓
    ├─→ Re-render on state change
    ├─→ Show loading spinner
    ├─→ Show error message
    └─→ Show success data
```

## Period Selection Flow

```
User opens page
    ↓
useEffect triggers (empty dependency)
    ↓
dispatch(fetchPayrollPeriods())
    ↓
API returns: ["2024-10", "2024-11", "2024-12"]
    ↓
Redux: periods[] = [...available periods...]
    ↓
Select dropdown populated
    ↓
User selects period
    ↓
dispatch(setSelectedPeriod("2024-10"))
    ↓
useEffect triggers (selectedPeriod dependency)
    ↓
dispatch(fetchPayrollByPeriod({ payrollPeriod: "2024-10", ... }))
dispatch(fetchPayrollSummary("2024-10"))
    ↓
Both API calls execute
    ↓
Redux state updated with:
    • payrolls[] with all employees
    • summary with statistics
    ↓
UI displays all data
    ↓
Table with summary cards rendered
```

## Error Handling Flow

```
User action triggers thunk
    ↓
API call made
    ↓
    ├─→ Network error
    │   ↓
    │   catch block
    │   ↓
    │   rejectWithValue("Network error")
    │
    ├─→ API error (400/401/500)
    │   ↓
    │   catch block
    │   ↓
    │   rejectWithValue(response.data.message)
    │
    └─→ Validation error
        ↓
        reject immediately
        ↓
        rejectWithValue("Validation failed")

Redux rejected case
    ↓
    • state.error = error message
    • state.loading = false
    ↓
Component receives error state
    ↓
    ├─→ If in dialog: Show error toast
    │   toast.error(state.error)
    │
    └─→ If in table: Show error message
        Display inline error notification
        
Error clears when
    • New successful action
    • User calls clearError()
    • User navigates away
```

## Approval Workflow States

```
Initial State: PENDING
    │
    ├─→ Manager clicks "Duyệt" → Dialog
    │   │
    │   ├─→ Manager confirms
    │   │   │
    │   │   ▼
    │   │   API: approvePayroll()
    │   │   │
    │   │   ▼
    │   │   Status: APPROVED ✓
    │   │   approvalDate: "2024-10-22"
    │   │   │
    │   │   ▼
    │   │   Button changes to "Đã Thanh Toán"
    │   │
    │   └─→ Manager cancels
    │       Dialog closes (no change)
    │
    └─→ Manager clicks "Từ Chối" → Dialog with reason
        │
        ├─→ Manager enters reason + confirms
        │   │
        │   ▼
        │   API: rejectPayroll(reason)
        │   │
        │   ▼
        │   Status: REJECTED ✗
        │   No more buttons
        │
        └─→ Manager cancels
            Dialog closes (no change)

From APPROVED State:
    │
    └─→ Manager clicks "Đã Thanh Toán" → Dialog
        │
        ├─→ Manager confirms
        │   │
        │   ▼
        │   API: markAsPaid()
        │   │
        │   ▼
        │   Status: PAID ✓
        │   paidDate: "2024-10-22"
        │   │
        │   ▼
        │   No more action buttons
        │   Workflow complete
        │
        └─→ Manager cancels
            Dialog closes (no change)
```

---

This architecture ensures:
- ✅ Separation of concerns (UI, State, API)
- ✅ Type safety (TypeScript throughout)
- ✅ Scalability (easy to add features)
- ✅ Maintainability (clear patterns)
- ✅ Testability (isolated layers)
- ✅ Error handling (comprehensive)
- ✅ User feedback (toasts, loading, states)
