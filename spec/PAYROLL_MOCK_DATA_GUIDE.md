# Mock Payroll Data Guide

## 📊 Overview

Mock payroll data has been added to help you visualize the payroll system without a backend server.

## 🗂️ File Location

`src/lib/payroll-mock-data.ts`

## 📋 Data Structure

### 6 Mock Employees with October 2024 Payroll

#### 1. **Nguyễn Văn A** (ID: 1)
- **Status**: PENDING (Chờ duyệt)
- **3 Jobs**:
  - JOB-001: Website Development (1.5M)
  - JOB-002: Database Design (1M)
  - JOB-003: API Integration (0.8M)
- **Subtotal**: 3.3M
- **Deductions**: 0.3M (taxes, insurance)
- **Bonus**: 0.2M (performance)
- **Total**: 3.2M

#### 2. **Trần Thị B** (ID: 2)
- **Status**: PENDING (Chờ duyệt)
- **2 Jobs**:
  - JOB-004: Mobile App UI (2M)
  - JOB-005: App Testing (1.2M)
- **Subtotal**: 3.2M
- **Deductions**: 0.25M
- **Bonus**: 0.3M
- **Total**: 3.25M

#### 3. **Lê Văn C** (ID: 3)
- **Status**: APPROVED (Đã duyệt)
- **2 Jobs**:
  - JOB-006: QA Testing (1.3M)
  - JOB-007: Bug Fixing (1.1M)
- **Subtotal**: 2.4M
- **Deductions**: 0.2M
- **Bonus**: 0.1M
- **Total**: 2.3M
- **Approved By**: Quản lý 1
- **Approval Date**: 2024-10-20

#### 4. **Phạm Thị D** (ID: 4)
- **Status**: PAID (Đã thanh toán) ✓
- **3 Jobs**:
  - JOB-008: Documentation (0.8M)
  - JOB-009: Code Review (0.9M)
  - JOB-010: Training (0.7M)
- **Subtotal**: 2.4M
- **Deductions**: 0.2M
- **Bonus**: 0.15M
- **Total**: 2.35M
- **Approved By**: Quản lý 1
- **Approval Date**: 2024-10-19
- **Paid Date**: 2024-10-21

#### 5. **Hoàng Văn E** (ID: 5)
- **Status**: PENDING (Chờ duyệt)
- **1 Job**:
  - JOB-011: System Architecture (2.5M)
- **Subtotal**: 2.5M
- **Deductions**: 0.25M
- **Bonus**: 0.5M (significant bonus)
- **Total**: 2.75M

#### 6. **Vũ Thị F** (ID: 6)
- **Status**: PENDING (Chờ duyệt)
- **2 Jobs**:
  - JOB-012: Performance Optimization (1.8M)
  - JOB-013: Security Audit (1.4M)
- **Subtotal**: 3.2M
- **Deductions**: 0.3M
- **Bonus**: 0.25M
- **Total**: 3.15M

---

## 📊 Summary Statistics (October 2024)

```
Total Employees: 6
Total Amount: 16.55M VND
Approved Amount: 2.3M VND
Paid Amount: 2.35M VND
Pending Amount: 11.9M VND
Average Salary: ~2.76M VND
```

**Status Breakdown**:
- ✏️ PENDING: 4 employees (4 payroll records)
- ✅ APPROVED: 1 employee (1 payroll record)
- ✓ PAID: 1 employee (1 payroll record)
- ✗ REJECTED: 0 employees

---

## 🔧 Enabling Mock Data

### In `.env` File

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Check Current Status

```bash
cat .env | grep USE_MOCK_DATA
# Output: NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## 🚀 How It Works

### Activation

1. **Environment Variable**: `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env`
2. **Auto-Detection**: Redux thunks check this flag
3. **Mock Data Returned**: Instead of API calls, mock data is returned
4. **Simulated Delay**: 500-800ms delay simulates real API response time

### Flow

```
User navigates to Payroll Page
    ↓
useEffect calls fetchPayrollPeriods()
    ↓
Check: NEXT_PUBLIC_USE_MOCK_DATA === "true"?
    ├─ YES: Return mockPayrollPeriods (500ms delay)
    └─ NO: Call PayrollApi.getPeriods()
    ↓
Period dropdown populated: ["2024-10", "2024-09", "2024-08"]
    ↓
User selects period "2024-10"
    ↓
useEffect calls fetchPayrollByPeriod()
    ↓
Check: NEXT_PUBLIC_USE_MOCK_DATA === "true"?
    ├─ YES: Return mockPayrollData (800ms delay)
    └─ NO: Call PayrollApi.getPayrollByPeriod()
    ↓
Table displays 6 employees with payroll records
```

---

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/lib/payroll-mock-data.ts` | Mock data definitions |
| `src/store/slice/payroll/Payroll.tsx` | Mock integration in Redux |
| `.env` | Enable/disable mock data |

---

## 🧪 Testing Workflow

### 1. **View Payroll Page**
```
✓ Login as Manager
✓ Click "Bảng Lương" in sidebar
✓ Navigate to /dashboard/payroll
✓ See "Select period..." dropdown
```

### 2. **Select Period**
```
✓ Click period dropdown
✓ See ["2024-10", "2024-09", "2024-08"]
✓ Select "2024-10"
✓ Spinner appears (800ms simulated delay)
```

### 3. **View Data**
```
✓ Summary cards display:
  • Total Employees: 6
  • Total Amount: 16,550,000 ₫
  • Approved Amount: 2,300,000 ₫
  • Paid Amount: 2,350,000 ₫

✓ Payroll table shows 6 employees:
  • Nguyễn Văn A (PENDING)
  • Trần Thị B (PENDING)
  • Lê Văn C (APPROVED)
  • Phạm Thị D (PAID)
  • Hoàng Văn E (PENDING)
  • Vũ Thị F (PENDING)
```

### 4. **Test Actions**
```
✓ Click "Xem Chi Tiết" → Detail dialog opens
✓ Click "Duyệt" → Approve dialog appears
✓ Click "Từ Chối" → Reject dialog with reason field
✓ Click "Đã Thanh Toán" → Mark paid dialog (only on APPROVED)
```

### 5. **Verify Details**
```
✓ Detail dialog shows:
  • Employee name
  • Job items (code, name, date, amount)
  • Subtotal, Deductions, Bonus
  • Total (highlighted)
  • Status & approval dates

✓ All amounts formatted as currency (VND)
✓ All dates formatted as DD/MM/YYYY
✓ Status badges color-coded (yellow/blue/green/red)
```

---

## 🎨 Formatting Examples

### Currency
```
Amount: 3,200,000 ₫
Format: Vietnamese locale (vi-VN)
Symbol: ₫
```

### Dates
```
Date: 20/10/2024
Format: DD/MM/YYYY
Locale: Vietnamese
```

### Status Colors
```
PENDING   → Yellow (#fbbf24)
APPROVED  → Blue (#3b82f6)
PAID      → Green (#22c55e)
REJECTED  → Red (#ef4444)
```

---

## 💡 Tips for Testing

### 1. **Open Browser DevTools**
```
Press F12 or Cmd+Option+I
Check Console for any errors
Watch Network tab (no API calls made)
```

### 2. **Verify Mock Data**
```
Open DevTools → Console
Type: store.getState().payroll
See payroll state with mock data
```

### 3. **Check Environment Variable**
```
Console: console.log(process.env.NEXT_PUBLIC_USE_MOCK_DATA)
Output: "true"
```

### 4. **Test Different Periods**
```
Note: All periods currently return same mock data
Can modify later to return different data per period
```

---

## 🔄 Switching Between Mock and Real Data

### Enable Mock Data (Development)
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Disable Mock Data (Production)
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

⚠️ **Important**: After changing `.env`, restart the dev server:
```bash
# Stop dev server (Ctrl+C)
npm run dev
# Start again
```

Then hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📊 Data Relationships

### Jobs → Employees → Payroll

```
JOB-001 (1.5M) ──┐
JOB-002 (1M)   ├─→ Nguyễn Văn A → Payroll (3.2M, PENDING)
JOB-003 (0.8M) ┘

JOB-004 (2M)   ──┐
JOB-005 (1.2M) ──→ Trần Thị B → Payroll (3.25M, PENDING)

JOB-006 (1.3M) ──┐
JOB-007 (1.1M) ──→ Lê Văn C → Payroll (2.3M, APPROVED)

JOB-008 (0.8M) ──┐
JOB-009 (0.9M) ├─→ Phạm Thị D → Payroll (2.35M, PAID)
JOB-010 (0.7M) ┘

JOB-011 (2.5M) ──→ Hoàng Văn E → Payroll (2.75M, PENDING)

JOB-012 (1.8M) ──┐
JOB-013 (1.4M) ──→ Vũ Thị F → Payroll (3.15M, PENDING)
```

---

## 🐛 Troubleshooting

### **Problem**: Mock data not showing
**Solution**:
1. Check `.env`: `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: Cmd+Shift+R
4. Check console for errors

### **Problem**: Wrong data showing
**Solution**:
1. Clear browser cache
2. Clear `.next` folder: `rm -rf .next`
3. Restart dev server

### **Problem**: No API calls visible
**Solution**:
1. This is correct! Mock data bypasses API calls
2. Check Redux state in DevTools
3. Verify `NEXT_PUBLIC_USE_MOCK_DATA=true`

### **Problem**: Spinner shows forever
**Solution**:
1. Check browser console for errors
2. Restart dev server
3. Clear browser cache

---

## 📈 Future Enhancements

- [ ] Multiple periods with different data
- [ ] Randomized amounts for variety
- [ ] More employee records
- [ ] Sample rejection reasons
- [ ] Batch operation testing
- [ ] Performance testing with large datasets

---

## 📝 Notes

- Mock data is **identical** across all periods (can customize later)
- API delays are **simulated** (500-800ms) to mimic real responses
- Data **resets** on page refresh (no persistence)
- Perfect for **development** and **demos**
- **No backend required** to test UI

---

**Status**: ✅ Mock data ready to use

**Last Updated**: October 22, 2024
