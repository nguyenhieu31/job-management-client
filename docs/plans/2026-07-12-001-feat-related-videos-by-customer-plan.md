---
title: "feat: Show related jobs/videos by same customer in detail dialogs"
type: feat
status: completed
date: 2026-07-12
---

# feat: Show related jobs/videos by same customer in detail dialogs

## Summary

Add a "Related Work" section to both job and video detail dialogs that shows recent jobs and videos done for the same customer (by `customerCode`). Editors can reference past work done for that customer — by any employee — to match editing style. Shows key columns: done link, note, plus basic info.

---

## Problem Frame

When an editor is assigned a job or video, they need to see what previous work was done for the same customer — by any employee — to match the editing style. The `customerCode` field already exists on customer records. The video search API already supports `customerCode` filtering; the job search API needs it added. The missing piece is a shared UI component that surfaces related work at the point of need (the detail dialogs).

---

## Requirements

- R1. When viewing a job or video detail, show a "Related Work" section listing recent jobs and videos by the same customer
- R2. The section appears only when the customer has a `customerCode`
- R3. Each item shows: done link (clickable), note preview, employee who did it, status, and creation date
- R4. Items from both jobs (photos) and videos are shown, distinguished by type
- R5. Clicking a related item opens its own detail dialog
- R6. The related items list does not interfere with main Redux state

---

## Scope Boundaries

- Both job and video detail dialogs get the new section
- Backend: `customerCode` filter must be added to the jobs search API (`/admin/jobs/search-conditions`)
- Frontend: new shared component for the related-work list, integrated into both dialogs
- No changes to customer form, video form, job form, or table views
- No changes to video search API (already supports `customerCode`)

---

## Context & Research

### Relevant Code and Patterns

- `src/components/jobs/job-detail-dialog.tsx` — job detail dialog (737 lines). Target for job integration.
- `src/components/videos/video-detail-dialog.tsx` — video detail dialog (695 lines). Target for video integration.
- `src/services/JobApi.tsx:79-108` — `searchJobByConditions` API. Currently supports `keyword, jobStatus, paymentStatus, selectedEmployeeIds, selectedCustomerIds`. Does NOT support `customerCode` yet.
- `src/services/VideoApi.tsx:100-141` — `searchVideoByConditions` API. Already supports `customerCode` filter.
- `src/types/jobs.tsx:70-103` — `JobResponse` interface with `customer: CustomerInfo` (no `customerCode` field yet)
- `src/types/videos.tsx:33-62` — `VideoResponse` interface with `customer: CustomerInfo` (has `customerCode` field)
- `src/types/jobs.tsx:33-40` — `CustomerInfo` in jobs.tsx (no `customerCode` — needs adding)
- `src/types/videos.tsx:15-23` — `CustomerInfo` in videos.tsx (has `customerCode`)
- `src/components/jobs/job-table.tsx` — job table for column display patterns
- `src/components/videos/video-table.tsx` — video table for column display patterns

### API Gap

The video search API (`VideoApi.searchVideoByConditions`) already accepts `customerCode`. The job search API (`JobApi.searchJobByConditions`) does not — it needs a new `customerCode` parameter added to both the frontend API call and the backend endpoint.

---

## Key Technical Decisions

1. **Unified "Related Work" component** — A single `RelatedWorkSection` component that fetches from both job and video APIs and displays results in a unified list, distinguished by type badges. This avoids duplicating the logic across both dialogs.

2. **Local state + direct API calls (not Redux)** — Fetching related items via direct API calls and local `useState`. Avoids overwriting the main list state in Redux.

3. **Backend change needed for jobs** — Add `customerCode` parameter to `JobApi.searchJobByConditions` (frontend) and the corresponding backend endpoint `/admin/jobs/search-conditions`. Without this, jobs cannot be filtered by customer code.

4. **`customerCode` field missing from `CustomerInfo` in jobs.tsx** — Add the optional field to match the video type, so the dialog can read it from `job.customer.customerCode`.

---

## Implementation Units

### U1. Add `customerCode` to jobs CustomerInfo and search API

**Goal:** Enable job search by `customerCode` so the related-work feature works for jobs.

**Requirements:** R2, R6

**Dependencies:** None

**Files:**
- Modify: `src/types/jobs.tsx` — add `customerCode?: string` to `CustomerInfo` interface
- Modify: `src/services/JobApi.tsx` — add `customerCode?: string | null` to `searchJobByConditions` params and pass it in the request

**Approach:**
- Add optional `customerCode` field to `CustomerInfo` in `src/types/jobs.tsx`
- Add `customerCode?: string | null` to the `searchJobByConditions` parameter type
- Pass it as a query parameter when it exists

**Patterns to follow:**
- Same pattern as `VideoApi.searchVideoByConditions` which already handles `customerCode`

**Test scenarios:**
- Happy path: Calling `searchJobByConditions` with `customerCode` sends the correct query parameter
- Edge case: `customerCode` is null/undefined → parameter is omitted from the request

**Verification:**
- TypeScript compiles without errors
- API call includes `customerCode` param when provided

---

### U2. Create RelatedWorkSection component

**Goal:** Build a reusable component that fetches and displays related jobs/videos by customer code.

**Requirements:** R1, R3, R4, R5, R6

**Dependencies:** U1

**Files:**
- Create: `src/components/shared/related-work-section.tsx`

**Approach:**
- Accept props: `customerCode: string`, `currentItemId: number`, `currentItemType: "job" | "video"`
- On mount, fetch from both APIs:
  - `VideoApi.searchVideoByConditions({ customerCode, pageSize: 10 })`
  - `JobApi.searchJobByConditions({ customerCode, pageSize: 10 })` (after U1)
- Exclude the current item by ID from results
- Merge results into a single list, with each item typed as either job or video
- Display states:
  - **Loading**: spinner while fetching
  - **Empty**: "Không có công việc nào khác cho khách hàng này"
  - **Error**: error message with retry button
  - **Loaded**: list of items
- Each item rendered as a compact row with columns:
  - **Type badge**: "Photo" or "Video" (using existing Badge with appropriate colors)
  - **Code / Case name** (clickable — triggers detail dialog)
  - **Assignee name**
  - **Status badge** (reusing existing job/video status colors)
  - **Done link** — clickable external link icon if `doneLink` exists
  - **Note** — truncated text preview (max 1 line)
  - **Date**
- Items sorted by creation date, most recent first
- When an item is clicked, call `onViewItem(id, type)` callback prop

**Patterns to follow:**
- Existing status color maps and label maps from both dialogs
- Existing `formatDate` utility
- Existing badge variants

**Test scenarios:**
- Happy path: Component fetches from both APIs and displays merged list
- Edge case: One API fails → show partial results from the other API with an error note
- Edge case: Both APIs return empty → show empty state
- Edge case: `customerCode` is empty → render nothing
- Integration: Clicking an item calls `onViewItem` with correct id and type

**Verification:**
- Component renders merged results sorted by date
- Type badges correctly distinguish jobs vs videos
- Done link and note preview display correctly
- Loading, empty, and error states render properly

---

### U3. Integrate into job and video detail dialogs

**Goal:** Add the `RelatedWorkSection` component to both job and video detail dialogs.

**Requirements:** R1, R5

**Dependencies:** U2

**Files:**
- Modify: `src/components/jobs/job-detail-dialog.tsx`
- Modify: `src/components/videos/video-detail-dialog.tsx`

**Approach:**
- In each dialog, add local state: `selectedRelatedItem: { id: number; type: "job" | "video" } | null`
- After the existing content sections, add `<RelatedWorkSection>` when `customerCode` exists:
  ```tsx
  {video.customer.customerCode && (
    <RelatedWorkSection
      customerCode={video.customer.customerCode}
      currentItemId={video.id}
      currentItemType="video"
      onViewItem={(id, type) => setSelectedRelatedItem({ id, type })}
    />
  )}
  ```
- When `selectedRelatedItem` is set, open the corresponding detail dialog (job or video)
- Handle nested dialog close by setting `selectedRelatedItem` back to null
- Wrap in `<Separator />` to visually separate from other content

**Patterns to follow:**
- Existing dialog nesting pattern already used in both dialogs (preview media modal uses `createPortal`)
- The video dialog already handles external link rendering via `renderTextWithLinks`

**Test scenarios:**
- Happy path: Dialog for a job/video with `customerCode` shows the related work section
- Edge case: Customer has no `customerCode` → section is hidden entirely
- Integration: Clicking a related job opens the job detail dialog; clicking a related video opens the video detail dialog
- Integration: Closing a nested dialog returns to the parent dialog correctly

**Verification:**
- Section renders in both dialogs when `customerCode` exists
- Nested dialog opens and closes correctly
- Section is hidden when `customerCode` is null

---

## System-Wide Impact

- **API surface:** `searchJobByConditions` gains a new `customerCode` parameter (backward-compatible — optional)
- **Type system:** `CustomerInfo` in jobs.tsx gains optional `customerCode` field
- **Interaction graph:** No callbacks or middleware affected. The related-work section is self-contained.
- **State lifecycle:** No Redux state changes. All state is local to the dialogs.
- **Unchanged invariants:** Customer creation/editing, job/video forms, table views, and payment flows are unaffected.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Jobs API doesn't support `customerCode` yet | U1 handles adding the parameter. Backend team must also add support on the Java side for `/admin/jobs/search-conditions`. |
| Nested dialogs cause z-index issues | Radix Dialog handles stacking via portals. Each dialog instance has its own overlay. |
| `customerCode` may be null on older records | Section simply doesn't render — graceful degradation. |
| Two parallel API calls may slow dialog open | Both calls fire simultaneously. Each has a loading spinner scoped to the section only, not blocking the main dialog. |

---

## Sources & References

- Related code: `src/services/JobApi.tsx` (add customerCode), `src/services/VideoApi.tsx` (reference pattern)
- Types: `src/types/jobs.tsx` (CustomerInfo, JobResponse), `src/types/videos.tsx` (CustomerInfo, VideoResponse)
- Dialogs: `src/components/jobs/job-detail-dialog.tsx`, `src/components/videos/video-detail-dialog.tsx`
