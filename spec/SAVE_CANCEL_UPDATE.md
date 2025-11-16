# Save/Cancel Actions Update

## ✅ Feature Implemented

### Hide Other Actions When Editing

**Behavior:**
- Khi Manager thay đổi bất kỳ field nào (dropdown, input count), các action buttons khác sẽ **ẩn đi**
- Chỉ hiển thị 2 buttons: **Cancel** và **Save**
- Sau khi Save hoặc Cancel, các action buttons ban đầu sẽ hiện lại

## 🎨 Visual Flow

### Before Changes (No Pending):
```
Actions Column:
┌────────────────────────┐
│  [✏️ Edit] [🗑️ Delete]  │
└────────────────────────┘
```

### During Editing (Has Pending):
```
Actions Column:
┌──────────────────────────┐
│  [Cancel] [💾 Save]      │
└──────────────────────────┘
    ▲         ▲
    │         └─ Orange button (primary action)
    └─ Gray outline button (secondary action)
```

### After Save/Cancel:
```
Actions Column:
┌────────────────────────┐
│  [✏️ Edit] [🗑️ Delete]  │  ← Returns to normal
└────────────────────────┘
```

## 🔄 User Flow

### Scenario 1: Save Changes
```
1. Manager changes Job Status dropdown
   ↓
   Other actions disappear
   ↓
2. Only [Cancel] [Save] visible
   ↓
3. Manager changes Input Count
   ↓
   Still [Cancel] [Save] only
   ↓
4. Click [Save]
   ↓
   All changes sent to API
   ↓
5. Success!
   ↓
   [Edit] [Delete] buttons return
```

### Scenario 2: Cancel Changes
```
1. Manager changes Payment Status
   ↓
   Other actions disappear
   ↓
2. Only [Cancel] [Save] visible
   ↓
3. Manager changes Assigned Employee
   ↓
   Multiple changes tracked
   ↓
4. Click [Cancel]
   ↓
   All changes discarded
   ↓
5. Original values restored
   ↓
   [Edit] [Delete] buttons return
```

## 💻 Implementation

### Key Changes:

```typescript
// Before: Shows Save alongside other actions
{userRole === "manager" && hasChanges && (
  <Button>Save</Button>
)}
{availableActions.map(...)}

// After: Shows ONLY Save/Cancel when editing
{userRole === "manager" && hasChanges ? (
  <>
    <Button onClick={handleCancelChanges}>Cancel</Button>
    <Button onClick={handleSaveChanges}>Save</Button>
  </>
) : (
  // Normal actions when no changes
  availableActions.map(...)
)}
```

### New Function:

```typescript
const handleCancelChanges = (jobId: number) => {
  setPendingChanges(prev => {
    const newChanges = { ...prev }
    delete newChanges[jobId]
    return newChanges
  })
}
```

## 🎯 Benefits

### 1. **Focus Mode**
- User không bị distract bởi các actions khác
- Chỉ có 2 options: Lưu hoặc Hủy
- Clear call-to-action

### 2. **Prevent Mistakes**
- Không thể Edit hoặc Delete khi đang có changes
- Buộc phải Save hoặc Cancel trước
- Tránh mất dữ liệu

### 3. **Better UX**
- Rõ ràng đang ở chế độ "editing"
- Không thể trigger actions khác khi chưa save
- Consistent behavior

## 🎨 Button Styles

### Cancel Button:
```tsx
variant="outline"
className="border-gray-300 hover:bg-gray-100"
```
- Outline style (không nổi bật)
- Gray border
- Light hover effect
- Secondary action

### Save Button:
```tsx
variant="default"
className="bg-orange-600 hover:bg-orange-700"
```
- Solid orange background
- Darker orange on hover
- Primary action
- Eye-catching

## 📱 Responsive Behavior

### Desktop:
```
[Cancel] [Save]
   ▲       ▲
   │       └─ Side by side
   └─ Good spacing
```

### Mobile:
```
[Cancel]
[Save]
   ▲
   Stacked if needed
```

## 🔄 State Management

### States Tracked:
```typescript
pendingChanges = {
  1: {  // jobId
    jobStatus: "done",
    inputCount: 55,
    paymentStatus: "paid"
  },
  2: {
    assignedEmployee: "emp2"
  }
}
```

### Cancel Action:
```typescript
// Remove all pending changes for this job
delete pendingChanges[jobId]
```

### Save Action:
```typescript
// Process all changes
Object.entries(changes).forEach(([field, value]) => {
  onUpdateField(jobId, field, value)
})
// Then clear
delete pendingChanges[jobId]
```

## 🎭 Edge Cases Handled

### 1. Multiple Edits:
```
Change 1 → [Cancel] [Save]
Change 2 → Still [Cancel] [Save]
Change 3 → Still [Cancel] [Save]
```

### 2. Cancel Restores All:
```
Original: status="pending", count=50
Change 1: status="done"
Change 2: count=60
Cancel → status="pending", count=50
```

### 3. Different Jobs:
```
Job 1 editing → [Cancel] [Save]
Job 2 normal  → [Edit] [Delete]
Job 3 normal  → [Edit] [Delete]
```

## 📊 Action Comparison

| State | Manager Actions | Employee Actions | QA Actions |
|-------|----------------|------------------|------------|
| **Normal** | [Edit] [Delete] | [Take Job] or [Done Job] | [Take Review] or [Submit] |
| **Editing** | [Cancel] [Save] | N/A | N/A |
| **After Complete** | [Edit] [Delete] [Complete] | - | - |

## 💡 Future Enhancements

### Suggested:
- [ ] Add confirmation dialog for Cancel if many changes
- [ ] Show count of pending changes in Save button
- [ ] Keyboard shortcuts (Cmd+S to save, Esc to cancel)
- [ ] Visual indicator on edited cells (yellow background)
- [ ] Undo last change button

### Example Enhanced UI:
```
[Cancel] [Save Changes (3)]
                      ▲
            Number of pending changes
```

## 🧪 Testing Checklist

### Manager:
- [ ] Change dropdown → Only [Cancel] [Save] visible
- [ ] Change input → Only [Cancel] [Save] visible
- [ ] Make multiple changes → Still only [Cancel] [Save]
- [ ] Click Cancel → Changes discarded, actions return
- [ ] Click Save → Changes saved, actions return
- [ ] Edit button not visible during editing
- [ ] Delete button not visible during editing

### Other Roles:
- [ ] Employee: Actions not affected
- [ ] QA: Actions not affected
- [ ] No Cancel/Save buttons for non-managers

## 📝 Summary

✅ **Feature Completed:**
- Khi có pending changes → Chỉ hiển thị [Cancel] [Save]
- Các action khác (Edit, Delete, Complete, etc.) bị ẩn
- Sau Save/Cancel → Actions ban đầu hiện lại
- Cancel button để discard changes
- Better UX với focus mode

**Result:** User không bị distract, flow rõ ràng hơn, tránh lỗi khi editing!
