# Add Service Multi-Step Form — Implementation Plan

## Overview

This plan covers building a production-quality multi-step "Add Service" order form as a **public-facing page** — no login required. Customers can browse photo/video editing services, configure details, upload files, enter their contact info, and submit an order. The form lives on its own route with a dedicated customer-facing layout (no dashboard sidebar, no auth).

**Status:** Active
**Created:** 2026-06-25
**Type:** `feat`
**Depth:** Standard

---

## 🎯 Scope Boundaries

### In Scope
- Step 1: Service type selection (Photo Editing: 10 services, Video Editing: 7 services) as card-style checkboxes grouped by category
- Step 2: Service details — turnaround time, video editing options (style, aspect ratio, music, agent, captions, transitions, required/excluded shots, reference videos, creative freedom), virtual staging (room type + style), file upload methods, revision policy confirmation
- Conditional rendering: video editing sections show only when at least one video service is selected; virtual staging section shows only when Virtual Staging is selected
- Form validation: disable Next until ≥1 service selected; disable Submit until required confirmations checked
- Live order summary card: desktop sidebar, collapsible on mobile
- Reusable components: CheckboxCard, RadioGroupField, ConditionalSection, TextareaField, UploadBlock, SummaryCard
- Subtle transitions for conditional section appear/disappear
- Premium dashboard styling matching existing design system
- Full form state management with nested structured data
- Customer info collection: name, email, phone, order notes
- Public page with its own branded layout (no dashboard sidebar, no auth guard)
- Vietnamese labels throughout (this is a Vietnamese real-estate media editing service)
- Form state management via `useRef` + `useReducer` (following existing codebase pattern)

### Out of Scope (Deferred)
- Backend API endpoint and database schema for submitting the order
- Redux slice + service layer (will be added when backend API contract is defined)
- Email confirmation or order tracking for customers
- Multi-language support (English)
- reCAPTCHA or bot protection
- Authentication / admin-side order management

---

## 🏗️ High-Level Technical Design

### Architecture

```
PublicLayout (no sidebar, branded header/footer)
  └── AddServiceForm (top-level container)
        ├── StepIndicator (step 1 of 2 / step 2 of 2)
        ├── Step 1: ServiceTypeStep
        │     ├── CategoryCard (Photo Editing)
        │     │     └── ServiceCard × 10 (checkbox cards)
        │     └── CategoryCard (Video Editing)
        │           └── ServiceCard × 7 (checkbox cards)
        ├── Step 2: ServiceDetailsStep
        │     ├── CustomerInfoSection (name, email, phone, notes)
        │     ├── TurnaroundSection (radio group)
        │     ├── ConditionalSection (video editing)
  │     │     ├── VideoStyleSection (radio)
  │     │     ├── AspectRatioSection (checkbox)
  │     │     ├── MusicSection (radio + conditional upload)
  │     │     ├── RealtimeSection (checkbox)
  │     │     ├── TextCaptionsSection (checkbox)
  │     │     ├── TransitionsSection (radio)
  │     │     ├── RequiredShotsSection (textarea)
  │     │     ├── ExcludedShotsSection (textarea)
  │     │     ├── ReferenceVideosSection (textarea/URL)
  │     │     └── CreativeFreedomSection (radio)
  │     ├── ConditionalSection (virtual staging)
  │     │     ├── RoomTypeSection (checkbox)
  │     │     └── StyleSection (radio)
  │     ├── FileUploadSection (checkbox + conditional inputs)
  │     └── ConfirmationSection (required checkboxes)
  ├── SummarySidebar (desktop) / CollapsibleSummary (mobile)
  └── NavigationFooter (Previous / Next / Submit)
```

### State Management

Follow the existing `useRef` + `useReducer` pattern established in `job-form.tsx` and `video-form.tsx`:

```typescript
// Single ref holds all form state across steps
interface AddServiceFormState {
  // Customer info (no-auth flow)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNotes: string;
  // Service selection
  selectedServices: string[];
  turnaround: string;
  videoStyle: string;
  aspectRatios: string[];
  music: string;
  musicFile: File | null;
  realtorAgent: string[];
  textCaptions: string[];
  transitions: string;
  requiredShots: string;
  excludedShots: string;
  referenceVideos: string;
  creativeFreedom: string;
  uploadMethods: string[];
  dropboxLink: string;
  googleDriveLink: string;
  wetransferLink: string;
  directUploadFiles: File[];
  virtualStagingRooms: string[];
  virtualStagingStyle: string;
  confirmRequirements: boolean;
  confirmExtraCharges: boolean;
}
```

- `useRef<AddServiceFormState>` persists all field values across step transitions without re-renders
- `useReducer` counter for forced re-renders when fields change
- `currentStep` tracked via `useState<number>`
- Validation functions per step: `validateStep1()`, `validateStep2()`

---

## 🧩 Implementation Units

### U1. Types and Service Constants

**Goal:** Define all TypeScript interfaces for form state, service configuration, and option data.

**Files:**
- `src/types/services.tsx` — create

**Approach:**
- Define `AddServiceFormState` interface with all nested fields, including customer info:
  - `customerName`, `customerEmail`, `customerPhone`, `orderNotes`
- Define service option data as typed constant arrays:
  - `PHOTO_SERVICES`, `VIDEO_SERVICES` with `{ id, label, subtitle: string }`
  - `TURNAROUND_OPTIONS`, `VIDEO_STYLE_OPTIONS`, `ASPECT_RATIO_OPTIONS`, etc.
  - Virtual staging room types and style options
  - Upload method options
  - Confirmation checkbox options
- Define `ServiceCategory` type and helper function `isVideoServiceSelected(state)` for conditional rendering
- All labels in Vietnamese following app convention

**Test scenarios:**
- Service constant arrays contain correct items with expected structure
- `isVideoServiceSelected()` returns true when any video service ID is in selectedServices
- `isVideoServiceSelected()` returns false when only photo services are selected
- TypeScript compilation: state object satisfies `AddServiceFormState` interface

**Verification:** Types compile without errors, constants are importable, helper functions return correct booleans.

---

### U2. Reusable Form Components

**Goal:** Build the reusable building blocks used across both steps.

**Files:**
- `src/components/services/service-card.tsx` — create
- `src/components/services/radio-group-field.tsx` — create
- `src/components/services/conditional-section.tsx` — create
- `src/components/services/textarea-field.tsx` — create
- `src/components/services/upload-block.tsx` — create

**Approach:**

**ServiceCard** — Selectable checkbox card component:
- Props: `id, label, subtitle, checked, onChange, disabled?`
- Renders as a styled card with checkbox, title, subtitle
- Visual states: default, hover, selected (border highlight + subtle background), disabled
- Accessible: label wraps entire card, checkbox has `aria-label`

**RadioGroupField** — Styled radio group:
- Props: `name, options: { value, label }[], value, onChange, legend`
- Renders as fieldset + legend + radio items
- Accessible: fieldset/legend, each input has `<label>`
- Use existing shadcn RadioGroup or build with native radio + Tailwind

**ConditionalSection** — Wrapper with enter/exit animation:
- Props: `show: boolean, children`
- Uses CSS transitions (max-height + opacity) or framer-motion if available
- Smooth slide-down/slide-up on show/hide

**TextareaField** — Labeled textarea:
- Props: `label, placeholder, value, onChange, required?`
- Uses existing shadcn `Textarea` component

**UploadBlock** — File upload method selector:
- Props: `value: string[], onChange, files: File[], onFilesChange`
- Renders checkbox options for Dropbox/Google Drive/WeTransfer/Direct upload
- Shows URL input for link-based methods, drag-and-drop area for Direct upload
- Reuse existing `src/components/ui/file-upload.tsx` for drag-and-drop

**Test scenarios:**
- ServiceCard renders checked/unchecked states correctly, fires onChange on click
- RadioGroupField: clicking an option selects it, deselects previous
- ConditionalSection: content is visible when `show=true`, hidden when `show=false`, has CSS transition
- UploadBlock: checking "Dropbox" shows URL input, unchecking hides it
- UploadBlock: checking "Direct upload" shows drag-and-drop area

**Verification:** Each component renders correctly, responds to prop changes, transitions are smooth.

---

### U3. Step 1 — Service Type Selection

**Goal:** Build the first step with card-style grouped checkboxes for photo and video editing services.

**Files:**
- `src/components/services/service-type-step.tsx` — create

**Approach:**
- Component receives: `value: string[], onChange: (services: string[]) => void`
- Renders two sections with category headers:
  - "Chỉnh sửa ảnh" (Photo Editing) — 10 service cards
  - "Chỉnh sửa video" (Video Editing) — 7 service cards
- Uses `ServiceCard` component from U2 for each service
- Uses data from service constant arrays in U1
- Groups are separated visually with category labels, subtle dividers
- Each service card shows title and subtitle (concise description)
- Selection count badge: "Đã chọn: X dịch vụ"
- Validation passes when `selectedServices.length > 0`

**Patterns to follow:** Existing card/list patterns in `job-detail-dialog.tsx`, filter bars

**Test scenarios:**
- All 17 services render with correct labels grouped by category
- Clicking a card toggles its selection state
- Multiple services can be selected simultaneously
- Selection count updates correctly
- Empty state: no services selected initially

**Verification:** Step renders with correct Vietnamese labels, selection works, count updates.

---

### U4. Step 2 — Service Details

**Goal:** Build all conditional form sections for service details.

**Files:**
- `src/components/services/service-details-step.tsx` — create

**Approach:**
- Single component receiving:
  - `state: AddServiceFormState`
  - `onChange: (field, value) => void`
  - `selectedServices: string[]` (for conditional logic)
- Sections render sequentially, each wrapped in `ConditionalSection` where applicable:
  1. **Customer Information** — always visible, text inputs for name (required), email (required, validated), phone, and optional order notes textarea
  2. **Turnaround Time** — always visible, radio group (6h/12h/24h/48h/Custom)
  3. **Video Editing sections** — wrapped in `ConditionalSection show={isVideoServiceSelected}`
     - Video Editing Style (radio)
     - Aspect Ratio (checkbox group)
     - Music (radio + conditional file upload)
     - Agent (checkbox group)
     - Text & Captions (checkbox group)
     - Transitions (radio)
     - Required Shots (textarea)
     - Excluded Shots (textarea)
     - Reference Videos (textarea)
     - Creative Freedom (radio)
  3. **Virtual Staging** — wrapped in `ConditionalSection show={isVirtualStagingSelected}`
     - Room Type (checkbox group)
     - Style (radio group)
  4. **Upload Files** — always visible (checkbox + conditional inputs)
  5. **Revision Policy** — always visible, required checkboxes with `required` validation
- All labels in Vietnamese
- Sections separated by subtle borders/headers with icons

**Test scenarios:**
- Customer info section renders with name, email, phone, notes fields
- Email field validates proper email format (shows error for invalid input)
- Name field shows validation error when empty on submit attempt
- All always-visible sections render (customer info, turnaround, upload, confirmation)
- Video sections are hidden when no video service is selected
- Video sections appear with slide animation when a video service is selected
- Music "I will provide music" triggers file upload field
- Virtual staging sections only appear when "Virtual Staging" is selected
- Dropbox/Drive/WeTransfer checkboxes show corresponding URL inputs
- Direct upload checkbox shows drag-and-drop area
- Confirmation checkboxes: Submit is disabled until both are checked
- All radio groups allow single selection only
- All checkbox groups allow multi-selection
- Textareas accept and display input correctly

**Verification:** Step renders all sections correctly, conditional sections show/hide with animation, all field interactions work.

---

### U5. AddServiceForm Container & Summary Sidebar

**Goal:** Build the top-level orchestrator with step management, validation, navigation, and summary.

**Files:**
- `src/components/services/add-service-form.tsx` — create
- `src/components/services/summary-card.tsx` — create
- `src/components/services/step-indicator.tsx` — create

**Approach:**

**StepIndicator:**
- Props: `currentStep: 1 | 2, totalSteps: 2`
- Shows "Bước 1: Chọn dịch vụ" / "Bước 2: Chi tiết dịch vụ"
- Active/completed/pending visual states with connecting line

**SummaryCard:**
- Props: `state: AddServiceFormState`
- Desktop: sticky sidebar card
- Mobile: collapsible panel (toggle button inside form)
- Shows: selected service names, turnaround time, video options summary, upload methods
- Empty state: "Chưa chọn dịch vụ"

**AddServiceForm (container):**
- `"use client"` directive
- Uses `useRef<AddServiceFormState>` for all form data
- Uses `useState<number>` for `currentStep`
- Uses `useReducer` counter for `forceUpdate`
- Step navigation:
  - Previous: decrements step
  - Next: validates current step, increments on pass
  - Submit: validates all, assembles payload, calls `onSubmit` prop
- Validation:
  - Step 1: at least one service selected
  - Step 2: confirmation checkboxes must be checked
  - Inline error messages below invalid fields
- Two-column layout on desktop (lg+):
  - Left (flex-1): Step content
  - Right (w-80): Sticky SummaryCard
- Single column on mobile: SummaryCard becomes collapsible at top
- Sticky step header with StepIndicator
- Sticky navigation footer with Previous (hidden on step 1), Next (hidden on step 2), Submit (step 2 only)
- Next button disabled when validation fails
- Submit button disabled when confirmations unchecked
- Subtle page-level transitions when switching steps (fade + slide)

**Patterns to follow:** Existing form pattern from `job-form.tsx`, `video-form.tsx` (useRef + useReducer)

**Test scenarios:**
- Step 1 → Next is disabled when 0 services selected, enabled when ≥1 selected
- Step 1 → Next transitions to Step 2 on click
- Step 2 → Previous returns to Step 1 without losing state
- Step 2 → Submit is disabled when confirmations are unchecked, enabled when both checked
- Stepping back and forth preserves all selected values
- Summary sidebar shows correct live data
- Mobile: collapsible summary toggles open/closed
- Sticky header/footer remain in viewport during scroll
- Form state is properly reset on close/mount

**Verification:** Multi-step flow works correctly, validation gates function, summary stays in sync.

---

### U6. Public Layout & Brand Identity

**Goal:** Create a customer-facing layout (no auth, no sidebar) with brand assets for the order page.

**Files:**
- `src/app/(public)/layout.tsx` — create
- `src/app/(public)/order-service/page.tsx` — create
- `public/logo.svg` — use existing or place brand logo

**Approach:**
- Use Next.js **Route Groups** to scope a public section: `src/app/(public)/`
- `layout.tsx` renders a clean customer layout:
  - Top navbar with brand logo/name ("PT Editing Service")
  - Main content area (centered, max-width container)
  - Minimal footer with contact info
  - No dashboard sidebar, no auth check
  - Clean white/light background (different from dashboard dark sidebar theme)
- `dat-dich-vu/page.tsx` renders `AddServiceForm` from U5
- Page metadata: title "Đặt Dịch Vụ | PT Editing Service", description
- `onSubmit` stub: logs payload to console, shows success toast/state

**Patterns to follow:** `src/app/dashboard/layout.tsx` for layout structure, `src/app/layout.tsx` for root setup

**Test scenarios:**
- Route `/order-service` loads without redirecting to login
- Public layout renders brand navbar + footer (no sidebar)
- Form renders correctly inside the public layout
- Submit handler logs correct payload shape
- Success state displays after submission (stub)

**Verification:** Public route accessible without auth, layout looks like a branded customer page.

---

## 📱 Responsive Design Strategy

| Breakpoint | Layout |
|---|---|
| `< lg` (1024px) | Single column: Step content full width, Summary as collapsible at top |
| `>= lg` | Two columns: Form content (flex-1) + sticky Summary sidebar (w-80) |

- Cards in Step 1: 2-column grid on mobile, 3-column on tablet, 4-column on desktop
- Form fields: full width on mobile, 2-column grid where appropriate on desktop
- Sticky elements adjust to mobile (no sticky on mobile, or reduced top offset)

---

## 🎨 Aesthetic Direction

Follow `frontend-design` guidelines:
- **Tone:** Premium, trustworthy, inviting — customer-facing brand experience (not internal dashboard)
- **Typography:** Leverage existing app font (Geist), use weight hierarchy (bold for card titles, medium for section headers, regular for body)
- **Color:** Light/clean background for the public layout (vs the dashboard's dark sidebar), brand accent color for CTAs and selected states. Use existing CSS variable theme as base
- **Layout:** Centered max-width container (wider on desktop), generous whitespace, the form is the hero of the page
- **Brand elements:** Company name/logo in navbar, subtle footer with contact info, consistent visual identity
- **Cards:** Subtle border + shadow on default, accent border on selected, smooth color transition
- **Motion:** Conditional sections use height/opacity CSS transitions (0.3s ease); step transitions use fade + slight slide (0.2s); micro-interactions on checkbox hover/select
- **Vietnamese labels** throughout UI text (brand name, form labels, error messages)

---

## 🧪 Test Scenarios Summary

| Unit | Scenarios |
|---|---|
| U1 | 4 (constants structure, isVideoServiceSelected x3) |
| U2 | 5 (ServiceCard: checked/unchecked/onChange; RadioGroupField: selection; ConditionalSection: show/hide/transition; UploadBlock: conditional inputs x2) |
| U3 | 5 (all 17 render, toggle selection, multi-select, count, empty) |
| U4 | 11 (always-visible sections, video sections hidden/shown, music upload trigger, virtual staging conditional, upload conditional inputs, direct upload, confirmation validation, radio single-select, checkbox multi-select, textarea input) |
| U5 | 9 (step 1 validation, step transition, step 2 validation, state persistence, summary sync, mobile collapsible, sticky elements, state reset, nav flow) |
| U6 | 5 (public route accessible without auth, brand layout, form renders, submit payload, success state) |

---

## ⚠️ Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| No existing multi-step form pattern | Higher initial implementation cost | Use proven `useRef` + `useReducer` pattern, extend for step management |
| Large number of conditional sections | Component complexity | Extract each section as a focused sub-component, use ConditionalSection wrapper |
| Form state loss on step navigation | Poor UX | Single ref across all steps, ref persists across renders |
| File upload state management | Technical complexity | Keep files in ref, use existing `file-upload.tsx` component |
| Sticky sidebar + step content scroll interaction | Layout bugs | Test thoroughly at viewport sizes, use `sticky` with proper top offset |
| Public form is exposed without auth | Spam submissions | Defer to backend: rate limiting, CAPTCHA, or IP-based throttling on API side |
| Email validation in frontend | Invalid contacts lose orders | Validate email format + required field; backend should also validate |

---

## 📋 Dependencies

- shadcn/ui primitives: `Button`, `Checkbox`, `Input`, `Label`, `Textarea`, `Card`, `Separator`, `Badge`, `ScrollArea`
- Existing `file-upload.tsx` for drag-and-drop
- `lucide-react` icons for section headers and UI enhancements
- `tailwind-merge` + `clsx` (already in project via `cn()` utility)
- No new npm packages required — all dependencies are already installed
- Email validation can use a simple regex pattern (no library needed for basic format check)

---

## 🔄 Sequencing

1. **U1** — Types & Constants (no dependencies)
2. **U2** — Reusable Components (depends on U1 for types)
3. **U3** — Step 1 (depends on U1, U2)
4. **U4** — Step 2 (depends on U1, U2, U3)
5. **U5** — Container & Summary (depends on U3, U4)
6. **U6** — Public Layout & Page (can start in parallel with U5, but needs U5 for form import)

Each unit should be implemented and verified before moving to the next.
