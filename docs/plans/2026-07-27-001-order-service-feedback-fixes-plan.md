---
type: fix
module: order-service
date: 2026-07-27
---

# Execution Plan: Order Service Feedback Requirements Fixes

This plan outlines the design and step-by-step implementation to resolve customer and manager feedback for the **Order Service** module in `linh_management_system`.

## Key Objectives & Scope

1. **Grass Replacement Photo Counter (+$1/photo)**: Allow selecting specific photo count for grass replacement (e.g. 20 out of 100 HDR photos) instead of flat single fee, charging `$1.00` per specified photo count.
2. **Allow Editing Customer Name**: Enable direct editing of customer name field during order creation/editing.
3. **Video Extended Duration (60s Base + 15s per +1)**: Display extended duration stepper only when `60s` duration is selected, adding 15 seconds per unit (`+1`) at `$10/unit`.
4. **AI Scene & 2D/3D Text Annotations**: Add dedicated annotation note fields for AI scenes (`aiSceneNote`) and 2D/3D text (`text2d3dNote`), showing complete info in summary and manager preview.
5. **Mandatory Instagram & Website**: Make `instagramHandle` and `websiteUrl` required fields in the Customer Information section with validation and required indicators.
6. **Clickable Links in Manager Order Preview**: Parse all option notes and text fields in order preview dialogs to automatically render hyperlinked URLs (`http://`, `https://`) that open in a new tab (`target="_blank"`).

---

## Affected Files & Architecture

- **`job-management-app/src/types/services.tsx`**:
  - Update `PhotoAddOns` interface (`grassReplacementCount`).
  - Update `AddServiceFormState` interface (`aiSceneNote`, `text2d3dNote`, `grassReplacementCount`).
  - Update pricing & description helpers (`getPhotoAddOnPrice`, `computeEstimatedPrice`, `getInitialFormState`).
- **`job-management-app/src/components/services/service-details-step.tsx`**:
  - Add Grass Replacement quantity stepper UI when checked.
  - Enable `customerName` editing.
  - Scope extended video duration stepper to `videoDuration === '60s'` and update label to show total seconds (`60s + (N * 15s)`).
  - Add annotation textarea/input fields for AI Scenes and 2D/3D Text.
  - Add required indicators (`*`) for Instagram Handle and Website URL.
- **`job-management-app/src/components/services/add-service-form.tsx`**:
  - Update validation rules to enforce non-empty `instagramHandle` and `websiteUrl`.
- **`job-management-app/src/components/services/summary-card.tsx`**:
  - Display detailed breakdown for Grass Replacement count, Video extended duration (with total seconds), AI Scene notes, and 2D/3D Text notes.
- **`job-management-app/src/components/services/order-history-table.tsx`**:
  - Add URL regex link renderer helper (`ClickableTextWithLinks`).
  - Render all option notes in preview dialog using clickable link renderer.
  - Display new Grass Replacement count and video annotation notes.

---

## Proposed Changes & Step-by-Step Implementation

### Step 1: Type Definitions & Pricing Calculations (`types/services.tsx`)

1. **Photo Add-Ons Interface**:
   ```typescript
   export interface PhotoAddOns {
     skyReplacement: boolean;
     tvScreenReplacement: boolean;
     grassReplacement: boolean;
     grassReplacementCount: number; // NEW: photo count for grass fix
     skyReplacementNote: string;
     tvScreenReplacementNote: string;
     grassReplacementNote: string;
   }
   ```

2. **Form State Extension**:
   ```typescript
   export interface AddServiceFormState {
     // ...
     aiSceneNote: string;      // NEW: Annotation notes for AI Scenes
     text2d3dNote: string;     // NEW: Annotation notes for 2D/3D Text
     // ...
   }
   ```

3. **Pricing Computations**:
   - `getPhotoAddOnPrice`:
     ```typescript
     if (key === "grassReplacement") {
       return (state.photoAddOns.grassReplacementCount || 0) * 1.0;
     }
     ```
   - Extended Duration Calculation:
     ```typescript
     export function getVideoDurationTotalSeconds(duration: string, extended: number): number {
       const base = duration === "15s" ? 15 : duration === "30s" ? 30 : duration === "60s" ? 60 : 0;
       if (duration === "60s") {
         return base + extended * 15;
       }
       return base;
     }
     ```

### Step 2: Form UI & Validation (`service-details-step.tsx` & `add-service-form.tsx`)

1. **Grass Replacement Counter UI**:
   - In `service-details-step.tsx`, render a `QuantityStepper` when `grassReplacement` checkbox is checked, allowing setting `grassReplacementCount` (0 to total photo quantity).

2. **Customer Name Editing**:
   - Remove `disabled={disableCustomerFields}` from `customerName` Input component or make it editable with clear feedback.

3. **Video Duration Options**:
   - Render `videoDurationExtended` stepper **ONLY** when `state.videoDuration === "60s"`.
   - Update help text: `"15 seconds added for every +1 (+ $10.00 / step). Total duration: X seconds."`
   - Reset `videoDurationExtended = 0` when switching away from `60s`.

4. **AI Scenes & 2D/3D Text Annotations**:
   - When `aiSceneCount > 0`, render input/textarea for `aiSceneNote`.
   - When `text2d3dCount > 0`, render input/textarea for `text2d3dNote`.

5. **Required Instagram & Website Validation**:
   - Add required red asterisk `*` to Instagram Handle and Website URL labels in `service-details-step.tsx`.
   - In `add-service-form.tsx` validation logic:
     ```typescript
     if (!state.instagramHandle.trim()) {
       newErrors.instagramHandle = "Instagram handle is required.";
     }
     if (!state.websiteUrl.trim()) {
       newErrors.websiteUrl = "Website URL is required.";
     }
     ```

### Step 3: Clickable Links & Preview Dialog (`order-history-table.tsx` & `summary-card.tsx`)

1. **URL Link Parser**:
   ```tsx
   function ClickableTextWithLinks({ text }: { text?: string }) {
     if (!text) return null;
     const urlRegex = /(https?:\/\/[^\s]+)/g;
     const parts = text.split(urlRegex);
     return (
       <span>
         {parts.map((part, i) =>
           urlRegex.test(part) ? (
             <a
               key={i}
               href={part}
               target="_blank"
               rel="noopener noreferrer"
               className="text-primary underline hover:text-primary/80 font-medium inline-flex items-center gap-1"
               onClick={(e) => e.stopPropagation()}
             >
               {part}
             </a>
           ) : (
             part
           )
         )}
       </span>
     );
   }
   ```

2. **Manager Preview Detail Dialog Integration**:
   - Wrap all note text displays in `order-history-table.tsx` preview dialog with `ClickableTextWithLinks`.
   - Ensure grass replacement photo count, extended video duration (total seconds), AI scene notes, and 2D/3D text notes are clearly displayed.

---

## Verification Plan

### Automated Checks
1. Run TypeScript typecheck & linter:
   ```bash
   cd job-management-app && npm run lint
   ```
2. Run build verification:
   ```bash
   cd job-management-app && npm run build
   ```

### Manual UX Verification
1. **Grass Replacement**: Check Grass Replacement with 100 HDR photos selected, set Grass Replacement photos to 20. Verify price increases by $20.00 ($1.00 x 20).
2. **Customer Name Editing**: Select a customer, edit customer name in input field. Confirm edited name persists and submits.
3. **Video Extended Duration**: Select `30s` -> verify extended stepper is hidden. Select `60s` -> verify extended stepper appears. Add `+2` -> verify duration displays `90s (60s + 30s)` and adds `$20.00`.
4. **AI & 2D/3D Text Annotations**: Set AI scene count = 2, enter annotation note. Set 2D/3D text count = 1, enter annotation note. Verify notes show in preview dialog.
5. **Customer Info Validation**: Submit form without Instagram or Website -> verify validation error messages appear.
6. **Clickable Links**: Enter notes with URLs (e.g. `https://dropbox.com/folder123`) in photo/video note fields. Open Manager Preview Detail dialog -> verify link is rendered as an `<a>` tag and opens in a new tab when clicked.
