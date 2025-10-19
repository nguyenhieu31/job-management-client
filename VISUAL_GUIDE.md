# 🎨 Visual Guide - Job Table Features

## 📋 Table Layout

```
┌─────────┬──────┬────────────┬───────────┬──────────┬─────────┬──────────┐
│  Code   │ Date │  Customer  │   Case    │  Input   │ Output  │ Actions  │
│         │      │    Name    │   Name    │  Count   │ Count   │          │
├─────────┼──────┼────────────┼───────────┼──────────┼─────────┼──────────┤
│ #JOB-001│ ... │   ABC Co   │ Redesign  │   [50]   │   45    │ [Save]   │
│         │     │            │           │   ^^^    │         │  [Edit]  │
│         │     │            │           │ editable │         │ [Delete] │
└─────────┴──────┴────────────┴───────────┴──────────┴─────────┴──────────┘
         ▲                                    ▲                    ▲
         │                                    │                    │
    Bordered cells                    Manager's Input      Save Button
                                     (blue border)      (orange, appears
                                                        when changes exist)
```

## 👔 MANAGER View

### Editable Fields:
```
┌─────────────────────────┐
│  Job Status   ▼         │  ← Dropdown (editable)
├─────────────────────────┤
│  Payment      ▼         │  ← Dropdown (editable)
├─────────────────────────┤
│  Input Count  [__50__]  │  ← Input (blue border) ✏️
├─────────────────────────┤
│  Output Count   45      │  ← Read-only ❌
├─────────────────────────┤
│  Assigned     ▼         │  ← Dropdown (editable)
├─────────────────────────┤
│  QA           ▼         │  ← Dropdown (editable)
└─────────────────────────┘
```

### Actions:
```
When NO changes:
  [✏️ Edit] [🗑️ Delete]

When HAS changes:
  [💾 Save] [✏️ Edit] [🗑️ Delete]
          ▲
     Orange button
```

### Workflow:
```
1. Change dropdown → 📝 Stored
2. Edit Input Count → 📝 Stored
3. Change Employee  → 📝 Stored
   ↓
4. [💾 Save] button appears (orange)
   ↓
5. Click Save → 🚀 API calls
   ↓
6. ✅ Success → Button disappears
```

---

## 👷 EMPLOYEE View

### Editable Fields:
```
┌─────────────────────────┐
│  Job Status   Pending   │  ← Badge (read-only) 👁️
├─────────────────────────┤
│  Input Count    50      │  ← Read-only ❌
├─────────────────────────┤
│  Output Count [__45__]  │  ← Input (green border) ✏️
└─────────────────────────┘
```

### Actions:
```
When status = PENDING:
  [🎮 Take Job]

When status = IN-PROGRESS:
  [✅ Done Job]
```

### Workflow:
```
1. Edit Output Count → Value stored locally
2. Click "Done Job" → Both status & count updated
```

---

## 🔍 QA View

### Editable Fields:
```
┌─────────────────────────┐
│  Job Status   Done      │  ← Badge (read-only) 👁️
├─────────────────────────┤
│  Input Count    50      │  ← Read-only ❌
├─────────────────────────┤
│  Output Count   45      │  ← Read-only ❌
└─────────────────────────┘
```

### Actions:
```
When status = DONE:
  [👁️ Take Review]

When status = IN-REVIEW:
  [📤 Submit Review]
```

---

## 🎨 Color Coding

### Input Fields:

**Manager's Input Count:**
```
┌─────────────────────┐
│  [____50____]       │  ← Blue border (border-blue-200)
└─────────────────────┘
     When focused:
     border-blue-400
```

**Employee's Output Count:**
```
┌─────────────────────┐
│  [____45____]       │  ← Green border (border-green-200)
└─────────────────────┘
     When focused:
     border-green-400
```

### Action Buttons:

```
🎮 Take Job       → Blue     (bg-blue-600)
✅ Done Job       → Green    (bg-green-600)
👁️ Take Review    → Purple   (bg-purple-600)
📤 Submit Review  → Indigo   (bg-indigo-600)
💾 Save           → Orange   (bg-orange-600)  ⭐ NEW
✅ Complete       → Emerald  (bg-emerald-600)
✏️ Edit           → Ghost    (transparent)
🗑️ Delete         → Ghost    (red text)
```

### Status Badges:

```
🟡 Pending        → Yellow   (bg-yellow-500/10)
🔵 In Progress    → Blue     (bg-blue-500/10)
🟢 Done           → Green    (bg-green-500/10)
🟣 In Review      → Purple   (bg-purple-500/10)
🔮 Reviewed       → Indigo   (bg-indigo-500/10)
🟢 Completed      → Emerald  (bg-emerald-500/10)
```

---

## 📱 Table Borders

### Before:
```
┌─────────────────────────────────────┐
│ Code  Date  Customer  Case  Actions │  ← No separation
└─────────────────────────────────────┘
```

### After:
```
┌──────┬──────┬──────────┬──────┬────────┐
│ Code │ Date │ Customer │ Case │ Actions│  ← Clear borders
└──────┴──────┴──────────┴──────┴────────┘
```

---

## 💾 Save Button Behavior

### State 1: No Changes
```
Actions Column:
  [✏️] [🗑️]
  
  No Save button
```

### State 2: Has Changes
```
Actions Column:
  [💾 Save] [✏️] [🗑️]
   ▲
   Orange, pulsing
   (indicates unsaved changes)
```

### State 3: Saving
```
Actions Column:
  [⏳ Saving...] [✏️] [🗑️]
   ▲
   Loading spinner
```

### State 4: Saved
```
Actions Column:
  [✏️] [🗑️]
  
  ✅ Toast: "Changes saved!"
  Save button disappears
```

---

## 🎯 Quick Reference Card

| Role | Input Count | Output Count | Save Button | Actions |
|------|-------------|--------------|-------------|---------|
| 👔 Manager | ✏️ Edit (blue) | ❌ View | ✅ Yes | Edit, Delete, Complete |
| 👷 Employee | ❌ View | ✏️ Edit (green) | ❌ No | Take, Done |
| 🔍 QA | ❌ View | ❌ View | ❌ No | Take Review, Submit |

---

## 🔔 Visual Feedback

### When Manager Makes Changes:

```
Step 1: Change dropdown
  ↓
  Dropdown value updates immediately
  ↓
Step 2: Edit Input Count
  ↓
  Input field shows new value
  Border glows blue on focus
  ↓
Step 3: Change another field
  ↓
  All changes tracked in state
  ↓
Step 4: Save button appears
  ↓
  [💾 Save] (orange, prominent)
  ↓
Step 5: Click Save
  ↓
  Button shows loading
  ↓
Step 6: Success
  ↓
  ✅ Toast notification
  Button disappears
  Changes persisted
```

---

## 📏 Responsive Design

### Desktop (>1024px):
```
All columns visible
Buttons side by side
Full labels shown
```

### Tablet (768px - 1024px):
```
Horizontal scroll enabled
Key columns prioritized
Buttons may wrap
```

### Mobile (<768px):
```
Horizontal scroll required
Compact view
Icon-only buttons
```

---

## 🎬 Animation Examples

### Save Button Appearance:
```
Opacity: 0 → 1
Scale:   0.9 → 1
Duration: 200ms
Easing:   ease-out
```

### Input Focus:
```
Border: border-gray-300 → border-blue-400
Shadow: none → ring-2 ring-blue-200
Duration: 150ms
```

### Success Toast:
```
Position: bottom-right
Slide:    translateY(100%) → translateY(0)
Duration: 300ms
Auto-dismiss: 3000ms
```

---

## 💡 Tips

### For Managers:
- 💡 Make multiple changes before saving
- 💡 Orange Save button = unsaved changes
- 💡 Click Save to batch all updates
- 💡 Input Count has blue border when editable

### For Employees:
- 💡 Output Count has green border when editable
- 💡 Update count as you work
- 💡 Use Done Job button when finished

### For QA:
- 💡 Counts are display-only
- 💡 Focus on review actions
- 💡 Status shown as badge
