# Payroll Feature - Quick Reference

## 🚀 Quick Start

### View the Feature
```
1. Login as Manager
2. Look for "Bảng Lương" in sidebar
3. Click to navigate to /dashboard/payroll
4. Select period from dropdown
5. View payroll data & statistics
```

## 📁 File Locations

```
Core Logic:
├── src/types/payroll.tsx                          # Type definitions
├── src/services/PayrollApi.tsx                    # API endpoints
├── src/store/slice/payroll/Payroll.tsx           # Redux state

UI Components:
├── src/components/payroll/payroll-table.tsx      # Main table
├── src/components/payroll/payroll-detail-dialog.tsx  # Detail view
└── src/components/payroll/payroll-action-dialog.tsx  # Action handler

Pages & Navigation:
├── src/app/dashboard/payroll/page.tsx            # Main page
├── src/components/dashboard/sidebar.tsx          # Navigation (updated)
└── src/store/store.tsx                           # Redux store (updated)

Documentation:
├── PAYROLL_FEATURE_GUIDE.md                      # Full guide
└── PAYROLL_IMPLEMENTATION_SUMMARY.md             # Implementation details
```

## 🔄 Data Flow (Redux)

```
User Action → Dialog/Button
    ↓
Component dispatches thunk
    ↓
Redux Thunk → PayrollApi
    ↓
API call → Backend/Mock
    ↓
Response → reducer updates state
    ↓
Component re-renders with new state
    ↓
Toast notification shown
```

## 💾 Redux State Path

```typescript
useAppSelector(state => state.payroll.payrolls)
useAppSelector(state => state.payroll.selectedPeriod)
useAppSelector(state => state.payroll.summary)
useAppSelector(state => state.payroll.loading)
useAppSelector(state => state.payroll.error)
useAppSelector(state => state.payroll.periods)
```

## 🎯 Payroll Statuses

| Status | Meaning | Buttons Available |
|--------|---------|------------------|
| PENDING | Awaiting approval | Approve, Reject |
| APPROVED | Ready to pay | Mark Paid |
| PAID | Payment complete | None |
| REJECTED | Rejected by manager | None |

## 📊 Status Color Scheme

| Status | Hex Color | RGB |
|--------|-----------|-----|
| PENDING | #fbbf24 | Yellow |
| APPROVED | #3b82f6 | Blue |
| PAID | #22c55e | Green |
| REJECTED | #ef4444 | Red |

## 🎨 UI Components

### PayrollTable
- Displays: Employee, Period, Amount, Status, Actions
- Responsive: Full width with overflow handling
- Interactive: Click detail button to expand

### PayrollDetailDialog
- Shows: Complete payroll breakdown
- Sections: Employee info, Job items, Financial summary, Dates
- Format: Currency in VND, dates in DD/MM/YYYY

### PayrollActionDialog
- Confirm: Simple yes/no for approve & pay
- Reject: Requires reason explanation
- Async: Shows loading state during action

## ⚙️ Redux Thunks Available

```typescript
// Fetch operations
dispatch(fetchPayrollByPeriod({ payrollPeriod, page, pageSize }))
dispatch(fetchPayrollSummary(period))
dispatch(fetchPayrollPeriods())

// Action operations  
dispatch(approvePayroll(payrollId))
dispatch(markPayrollAsPaid(payrollId))

// State updates
dispatch(setSelectedPeriod(period))
dispatch(clearError())
```

## 🔌 API Endpoints (Ready for Backend)

```
GET  /admin/payroll/{period}?page=X&pageSize=Y    # List payroll
GET  /admin/payroll/{period}/summary                # Statistics
GET  /admin/payroll/periods                         # Available periods
GET  /admin/payroll/employee/{empId}/{period}      # Employee payroll
POST /admin/payroll/generate/{period}              # Generate payroll
PUT  /admin/payroll/{id}/approve                   # Approve
PUT  /admin/payroll/{id}/reject                    # Reject
PUT  /admin/payroll/{id}/mark-paid                 # Mark paid
PUT  /admin/payroll/{id}                           # Update details
GET  /admin/payroll/{period}/export                # Export
```

## 🌍 Localization

All text uses Vietnamese (vi-VN):

| Item | Format | Example |
|------|--------|---------|
| Currency | VND | 5,000,000 ₫ |
| Date | DD/MM/YYYY | 20/10/2024 |
| Buttons | Vietnamese | "Duyệt", "Từ Chối", "Đã Thanh Toán" |
| Status | Vietnamese | "Chờ Duyệt", "Đã Duyệt", "Đã Thanh Toán" |

## ✅ Error Handling

**Validation:**
- Rejection reason required (prevents empty rejection)
- Period selection required (prevents undefined data fetch)
- Empty states show helpful messages

**Error Messages:**
- Toast notifications for success/error
- Redux error state stores error message
- API errors caught and displayed

## 🔐 Role-Based Access

**Manager:**
- ✅ Can see "Bảng Lương" menu
- ✅ Can access /dashboard/payroll
- ✅ Can approve/reject/mark paid

**Employee & QA:**
- ❌ Cannot see "Bảng Lương" menu
- ❌ Cannot access /dashboard/payroll
- ❌ No payroll permissions

**Access Control Location:**
```typescript
// sidebar.tsx - line ~26
const filteredNavigation = !roleName || roleName === 'EMPLOYEE' || roleName === 'QA' 
  ? navigation.filter(item => item.href === '/dashboard/job' || ...)
  : roleName === 'MANAGER'
  ? navigation.filter(item => item.href !== '/dashboard/settings')
  : navigation;
```

## 📝 Period Format

Payroll periods use ISO format: `YYYY-MM`

**Examples:**
- `2024-10` = October 2024
- `2024-11` = November 2024
- `2024-12` = December 2024

## 💰 Financial Calculation

```
Total = Subtotal - Deductions + Bonus

Where:
  Subtotal = sum of all job amounts for employee in period
  Deductions = salary reductions (e.g., taxes, loans)
  Bonus = additional compensation (e.g., performance, attendance)
```

## 🧪 Testing Tips

1. **Page Load:**
   - Check loading spinner shows while fetching
   - Verify period dropdown populates
   - Confirm table displays after selection

2. **Actions:**
   - Click "Xem Chi Tiết" → Verify detail dialog
   - Click "Duyệt" → Status should change to APPROVED
   - Click "Từ Chối" → Reason field should appear
   - Click "Đã Thanh Toán" → Paid date should populate

3. **Formatting:**
   - Amounts should show as currency (X,XXX,XXX ₫)
   - Dates should show as DD/MM/YYYY
   - Status colors should match spec above

4. **Responsive:**
   - Check on mobile (sidebar closes)
   - Check on tablet (medium screen)
   - Check on desktop (full width)

## 🐛 Troubleshooting

**Import Errors:**
- All payroll files are in correct locations
- Check TypeScript compiler for actual errors vs editor caching
- Clear .next folder if needed: `rm -rf .next`

**Module Not Found:**
- Verify all `@/` paths resolve correctly
- Check store includes `payroll: PayrollSlice`

**Components Not Showing:**
- Ensure logged in as MANAGER role
- Check browser console for errors
- Verify period selector has data

**Styling Issues:**
- Uses Tailwind CSS (already configured)
- Uses shadcn/ui components
- Check src/styles/globals.css

## 📚 Key Imports

```typescript
// Types
import { EmployeePayroll, PayrollStatus } from "@/types/payroll"

// Redux
import { useAppDispatch, useAppSelector } from "@/store/store"
import { fetchPayrollByPeriod, approvePayroll } from "@/store/slice/payroll/Payroll"

// Components
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Notifications
import { toast } from "react-toastify"
```

## 🚀 Performance Notes

- Pagination support built-in (page, pageSize parameters)
- Lazy loading of details only when clicked
- Summary stats cached per period
- Period list fetched once on mount
- React hooks optimize re-renders

## 🔄 Typical Workflow

```
1. Manager navigates to Bảng Lương
2. Selects October 2024 period
3. System fetches 20 employees with PENDING payroll
4. Manager reviews summary stats (15 employees, 75M VND total)
5. Manager clicks "Xem Chi Tiết" on first employee
6. Dialog shows breakdown of 4 jobs totaling 5M VND
7. Manager closes dialog, clicks "Duyệt" (Approve)
8. Confirmation dialog appears
9. Manager confirms
10. Status changes to APPROVED, table refreshes
11. "Duyệt" button becomes "Đã Thanh Toán" button
12. Process repeats for other employees
```

## 📖 Related Documentation

- See `PAYROLL_FEATURE_GUIDE.md` for detailed architecture
- See `PAYROLL_IMPLEMENTATION_SUMMARY.md` for complete file listing
- See `QUICK_REFERENCE.md` for general app shortcuts

---

**Status**: ✅ Ready for Testing & Backend Integration
**Last Updated**: Oct 22, 2024
