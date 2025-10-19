# 🚀 Quick Reference Card - Job Management Actions

## 👷 EMPLOYEE Actions

| Current Status | Available Action | Button | Result Status |
|----------------|------------------|--------|---------------|
| 🟡 PENDING | **Take Job** 🎮 | Blue | 🔵 IN-PROGRESS |
| 🔵 IN-PROGRESS | **Done Job** ✅ | Green | 🟢 DONE |

**Can View:** Code, Date, Case Name, Links, Counts, Status (read-only), Note

**Cannot:**
- ❌ Edit status via dropdown
- ❌ Delete jobs
- ❌ See customer info or prices

---

## 🔍 QA Actions

| Current Status | Available Action | Button | Result Status |
|----------------|------------------|--------|---------------|
| 🟢 DONE | **Take Review** 👁️ | Purple | 🟣 IN-REVIEW |
| 🟣 IN-REVIEW | **Submit Review** 📤 | Indigo | 🔮 REVIEWED |

**Can View:** Code, Date, Case Name, Links, Counts, Status (read-only), Note, Assigned Employee

**Cannot:**
- ❌ Edit status via dropdown
- ❌ Delete jobs
- ❌ See customer info or prices

---

## 👔 MANAGER Actions

| Current Status | Available Action | Button | Result Status |
|----------------|------------------|--------|---------------|
| 🔮 REVIEWED | **Complete** ✅ | Emerald | 🟢 COMPLETED |
| Any | **Edit** ✏️ | Ghost | - |
| Any | **Delete** 🗑️ | Ghost/Red | - |

**Can View:** ALL 15 columns (full access)

**Special Powers:**
- ✅ Edit status via dropdown (can skip workflow)
- ✅ Edit Payment Status, Assigned Employee, QA
- ✅ Delete any job
- ✅ Final approval authority

---

## 📊 Status Flow

```
┌─────────┐
│ PENDING │ ← Manager creates job
└────┬────┘
     │ Employee: Take Job 🎮
     ↓
┌──────────────┐
│ IN-PROGRESS  │ ← Employee working
└──────┬───────┘
       │ Employee: Done Job ✅
       ↓
┌──────┐
│ DONE │ ← Ready for QA
└───┬──┘
    │ QA: Take Review 👁️
    ↓
┌────────────┐
│ IN-REVIEW  │ ← QA reviewing
└─────┬──────┘
      │ QA: Submit Review 📤
      ↓
┌──────────┐
│ REVIEWED │ ← Waiting for Manager
└────┬─────┘
     │ Manager: Complete ✅
     ↓
┌───────────┐
│ COMPLETED │ ← Final state ✓
└───────────┘
```

---

## 🎨 Color Code

| Status | Color | Badge |
|--------|-------|-------|
| PENDING | 🟡 Yellow | Pending |
| IN-PROGRESS | 🔵 Blue | In Progress |
| DONE | 🟢 Green | Done |
| IN-REVIEW | 🟣 Purple | In Review |
| REVIEWED | 🔮 Indigo | Reviewed |
| COMPLETED | 🟢 Emerald | Completed |

---

## 💡 Quick Tips

### For Employees:
- Chỉ "Take" jobs khi sẵn sàng làm
- Click "Done" khi hoàn thành để QA có thể review
- Status chỉ để xem, không thể edit

### For QA:
- Review jobs có status "DONE"
- Kiểm tra kỹ trước khi "Submit Review"
- Status chỉ để xem, không thể edit

### For Managers:
- Có thể can thiệp bất cứ lúc nào
- Có dropdown để change status nhanh nếu cần
- Là người duyệt cuối cùng (Complete)
- Phân công Employee và QA cho từng job

---

## 🔧 Integration Points

```typescript
// Handle action
onJobAction={(jobId, action) => {
  // pending -> in-progress
  // in-progress -> done
  // done -> in-review
  // in-review -> reviewed
  // reviewed -> completed
}}

// Update field (Manager only)
onUpdateField={(jobId, field, value) => {
  // Update status, payment, employee, qa
}}
```

---

## 📞 Need Help?

Check detailed documentation:
- `JOB_WORKFLOW_GUIDE.md` - Complete workflow
- `JOB_TABLE_GUIDE.md` - Component usage
- `UPDATE_SUMMARY.md` - Implementation details
