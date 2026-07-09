---
title: "Customer order-service hub wired to public /orders API"
type: feat
status: active
created: 2026-07-02
target_repo: job-management-app
supersedes: "_localStorage-based stub from the 2026-07-02-001 first draft; the backend now ships real endpoints, so this revision uses them._"
related_backend_plan: "jobmanagement/docs/plans/2026-07-02-001-feat-order-service-crud-plan.md"
source_request: "#build plan edit order-service page of role customer with requirement like: has history order, button add new order service. When customer click button add new order service then open add-service-form. Not fill customer information at step 2, auto fill and not edit with information from authentication has email, fullName."
---

# Customer order-service hub wired to public /orders API

## Summary

Convert the customer `/dashboard/order-service` page from a permanently-open form into a self-contained customer hub that is wired against the real backend endpoints the team already shipped under `controller/orders/CustomerOrderController.java`. After this plan:

- A `Lịch sử đơn hàng` (Order history) section lists the current customer's orders, sourced from the real paged endpoint `GET /api/v1/orders/me`
- A primary `Đặt dịch vụ mới` button opens the existing `AddServiceForm` in a `Dialog`
- The form's customer name and email auto-populate from `state.authenticate` and are read-only
- Submitting the form calls `POST /api/v1/orders/submit` with the configuration as a JSON body; the server mirrors contact info from the principal's `Account` and stores the order; the new entry appears at the top of the history list after a refetch

The previous draft of this plan proposed a `localStorage` seam because no backend endpoint existed. That draft is obsolete: `CustomerOrderController.java` now exposes `POST /orders/submit`, `GET /orders/me`, and `PUT /orders/{id}` (all `ROLE_CUSTOMER`-gated), backed by `OrderService.getMyOrders(...)` which calls `OrderRepository.findByCustomerAndIsDeletedFalse(account, pageable)`. This revision targets those endpoints directly.

## Problem Frame

A customer logged into the app (password or Google OAuth — both populate the `CUSTOMER` role) lands on `/dashboard/order-service` and sees only an empty form. They must re-type their name and email on every order, even though both values already exist in Redux. After submitting, the form goes nowhere — `handleSubmit` in `src/app/dashboard/order-service/page.tsx:8-11` only calls `console.log` and shows a toast. The customer has no way to view their own order history.

Meanwhile, the backend now ships the full surface — `GET /api/v1/orders/me` returns the logged-in customer's paged `OrderResponse` list, and `POST /api/v1/orders/submit` persists a new `Order` mirroring contact info from the `Account`. The frontend simply isn't wired to it.

The customer flow today is, end-to-end: type everything → click submit → see toast → reload → no evidence the order happened. This plan closes that loop.

## Stakeholders & Impact

- **Customer (CUSTOMER role)**: gains a real hub page — persistent order history, one-click "Đặt dịch vụ mới", and the convenience of not re-typing identity fields on every order.
- **Frontend developers**: a tiny extension to `AddServiceForm` (two new optional props), a new `OrderApi` service, a new Redux slice, a new list component, and a page rewrite. No new dependencies. No new test runner.
- **Backend / API team**: not affected — all endpoints already shipped under the parent backend plan (`jobmanagement/docs/plans/2026-07-02-001-feat-order-service-crud-plan.md`).

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Order history data source** | `GET /api/v1/orders/me` against `OrderService.getMyOrders(account, pageNumber, pageSize)` → `OrderRepository.findByCustomerAndIsDeletedFalse` | The previous draft used `localStorage`. The backend now ships a real paged endpoint filtered by the authenticated customer's `Account`. Persistence is per-user across devices. No frontend-side storage is required. |
| **Pagination strategy** | Fetch page 1 (size 16 — matches the backend default in `CustomerOrderController.java:78`) on mount and after each submit; render all results with no client-side pagination | The backend default `pageSize=16` is the established customer-page convention. Customers are expected to have low order volumes; admin-side pagination would be over-engineering. Fetching on mount + on submit success is sufficient. |
| **Refresh trigger** | Re-dispatch `getMyOrders` after a successful submit, after the dialog closes, and on page focus/visibilitychange | The list shows the new order immediately after submit. The focus/visibility refetch (U5) covers the rare case where status changes happen via admin action in another tab. Skip if it adds noticeable load — fall back to mount-only. |
| **Modal component** | `Dialog` from `@/components/ui/dialog` (NOT a sheet) | `sheet.tsx` does not exist in the project. `Dialog` is the established convention (see `customer-form.tsx:78-89`, `employee-form.tsx:152-164`). |
| **Form pre-fill mechanism** | Extend `AddServiceForm` with optional `initial?: Partial<AddServiceFormState>` prop; merge into the `useRef` initializer | The form uses `useRef<AddServiceFormState>` + `useReducer`. Initial-value merge in the `useRef` initializer is the cleanest path. `useEffect`-based mutation would race with the form's own `forceUpdate`. |
| **Read-only enforcement** | New `disableCustomerFields?: boolean` prop passes `readOnly` to the `customerName` and `customerEmail` `Input`s in `service-details-step.tsx` | Spec said "auto fill and not edit". `customerPhone` remains editable — server mirrors it from the `Account` anyway, so the form's phone input is decorative; see Risks. |
| **Role gating** | CUSTOMER role gates the history section AND the "Đặt dịch vụ mới" button; non-CUSTOMER fallback keeps the inline `<AddServiceForm />` (preserves today's dev workflow for managers testing the route) | Matches `sidebar.tsx:37` — CUSTOMER's only nav item is this route, so for them it is the whole dashboard. For other roles we don't want to break dev workflows by hiding the form. |
| **`customerPhone` source for `POST /orders/submit`** | Send the user's `phoneNumber` from `state.authenticate`; fallback to the auth-typed form's `customerPhone`; final fallback to a sentinel `"unspecified"` to satisfy the DTO's `@NotBlank` constraint | The DTO `CreateOrderRequest.customerPhone` carries `@NotBlank`, but the server (`OrderServiceImpl.submitOrder:65-67`) ignores the request's phone and mirrors from `Account.phoneNumber`. The constraint is effectively a schema defense. The frontend must send a non-blank string to pass validation; the server's authoritative value comes from the `Account`. Send a defensible non-blank fallback to avoid 400 errors when the user has no phone. |
| **New dependencies** | None | Per `spec/ADD_SERVICE_FORM_PLAN.md` and the project convention. |
| **Tests** | None added | The repo has no test runner (no `test` script in `package.json`). Verification is manual via `npm run dev` + `npm run lint` + `npm run build`. |
| **i18n** | Vietnamese for all new user-facing strings | Matches the existing form and page. |

---

## High-Level Technical Design

*Directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```text
src/app/dashboard/order-service/page.tsx   (rewrite — customer hub)
│
├─ useAppSelector(state.authenticate)        → { fullName, email, phoneNumber, roleName }
├─ useAppDispatch()                          → for action dispatch
│
├─ On mount: dispatch getMyOrders() thunk
│
├─ CUSTOMER-only surface:
│   ├─ <OrderHistoryList orders={orders} />          (cards + empty state)
│   ├─ <Button onClick={() => setOpenForm(true)}>Đặt dịch vụ mới</Button>
│   └─ <Dialog open={openForm} onOpenChange={setOpenForm}>
│          <AddServiceForm
│            initial={{ customerName: fullName, customerEmail: email }}
│            disableCustomerFields
│            onSubmit={(state) => submitOrderThunk({ form: state })}
│          />
│       </Dialog>
│
└─ Non-CUSTOMER fallback: render existing inline <AddServiceForm />

Redux slice: store/slice/orders/Orders.tsx   (new)
Thunks:
  getMyOrders()                                       → GET /orders/me
  submitOrder(form: AddServiceFormState)              → POST /orders/submit

State: { orders: OrderResponse[], loading, error }
```

**State flow on submit**:
1. Customer clicks `Đặt dịch vụ mới` → `setOpenForm(true)`
2. Dialog opens. `AddServiceForm` mounts; `useRef` initializer merges `initial` over `getInitialFormState()`; step 2's `customerName` / `customerEmail` inputs render as `readOnly` because `disableCustomerFields` is `true`. `customerPhone` remains editable but the server mirrors it anyway.
3. Customer completes the form; `validateStep2()` passes (pre-populated name/email are non-empty so the trim check passes).
4. Form calls `onSubmit(formRef.current)`. The page handler builds a `CreateOrderRequestBody` from the form state (with the auth phone + JSON-serialized configuration) and dispatches `submitOrderThunk`.
5. The thunk calls `POST /api/v1/orders/submit`. On 200, it refetches `getMyOrders()` and closes the dialog; the success screen of the form is briefly visible inside the dialog before close.
6. On 400 / 401 / 500, the form's existing validation errors remain visible (the thunk shows a toast); the dialog stays open so the customer can retry.

**Data flow on mount**:
- `useEffect(() => { dispatch(getMyOrders()); }, [dispatch]);`
- The thunk calls `GET /api/v1/orders/me?pageNumber=0&pageSize=16`. The response (`ApiResponse<PageResponse<OrderResponse[]>>`) is unwrapped; the slice stores `orders` as the response's `data.data` array.
- On error, the slice stores the error message; the list renders the empty state.

---

## Backend Contract Reference

The frontend targets the actual controllers, DTOs, and enums already in `jobmanagement/`. This section pins the contract the implementation must satisfy — adjust only if the backend changes.

| Concern | Backend source | Frontend implication |
|---|---|---|
| `POST /api/v1/orders/submit` body | `CreateOrderRequest.java` (`customerName`, `customerEmail`, `customerPhone`, `orderNotes`, `configuration: JsonNode`, `estimatedPrice`, `status`) | All `@NotBlank`/`@NotNull` fields must be present; the configuration must be a `JsonNode` (send as `JSON.stringify(config)` then send as a JSON object body — `application/json`). |
| `POST /api/v1/orders/submit` response | `OrderResponse` (`id`, `code`, `customerName`, `customerEmail`, `customerPhone`, `orderNotes`, `status: OrderStatus`, `configuration: JsonNode`, `estimatedPrice`, `createdAt: String`, `updatedAt: String`), wrapped in `ApiResponse<OrderResponse>` | Used only for confirmation — frontend refetches the list immediately after, so the response payload is not displayed. |
| `GET /api/v1/orders/me?pageNumber=0&pageSize=16` response | `ApiResponse<PageResponse<List<OrderResponse>>>` | The page reads `response.data.data` (the `List<OrderResponse>`) and `response.data.totalElements` (for "Đã hiển thị X đơn hàng"). |
| `OrderStatus` enum values | `PENDING, REVIEWED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED` | Map to Vietnamese labels in U3: `Đang chờ, Đã xem, Đã xác nhận, Đang thực hiện, Hoàn thành, Đã hủy, Bị từ chối`. |
| Auth | Bearer cookie `accessToken` (auto-attached by `axiosInstance`) | No extra header work needed. |
| Customer identity for the history query | `Order.customer` is `@ManyToOne Account`; `findByCustomerAndIsDeletedFalse(account, pageable)` filters by the principal's `Account.id` | Frontend does not need to send any customer identifier — server derives it from the JWT. |

> **Note on `customerPhone` requirement:** The DTO requires `@NotBlank` but the server mirrors from the Account and ignores the request body value. The frontend's job is to pass validation by sending a non-blank string in the request body. The phone that ends up on the saved `Order.customerPhone` comes from `Account.phoneNumber` server-side. This is a minor coupling redundancy — do not "fix" it on the frontend by stripping the field.

---

## Implementation Units

### U1. Extend `AddServiceForm` to accept pre-populated customer fields

**Goal:** Let the page pass initial `customerName` / `customerEmail` and mark the customer-info section as read-only, without breaking the form's `useRef` + `useReducer` state model.

**Requirements:** Source request — "Not fill customer information at step 2, auto fill and not edit with information from authentication has email, fullName."

**Dependencies:** None.

**Files:**
- Modify: `src/components/services/add-service-form.tsx`
- Modify: `src/components/services/service-details-step.tsx`

**Approach:**
- Add two new optional props to `AddServiceFormProps`:
  - `initial?: Partial<AddServiceFormState>` — merged over `getInitialFormState()` in the `useRef` initializer
  - `disableCustomerFields?: boolean` — when `true`, `service-details-step.tsx` renders `customerName` and `customerEmail` `Input`s with `readOnly` (and a small helper text below the email saying `Đã được điền tự động từ tài khoản của bạn.`)
- Pass `disableCustomerFields` from `AddServiceForm` down to `ServiceDetailsStep` as a new prop.
- `customerPhone` stays editable even when `disableCustomerFields` is `true` (per the user's earlier confirmation: "phoneNumber not require"). The page wires the phone from `state.phoneNumber` into the form's existing `customerPhone` field via `initial?.customerPhone`. The form pre-fills the phone but allows the customer to override before submit.
- Do NOT touch the form's other state (selectedServices, turnaround, etc.) — only `customerName` and `customerEmail` carry auth-derived pre-fill.
- Do NOT remove `validateStep2`'s empty/trim checks for `customerName` / `customerEmail` — the page only passes `initial` when both are non-empty strings, but the form must keep validating if used without the new props.

**Patterns to follow:**
- `src/components/customers/customer-form.tsx:38-58` — `useEffect([editingCustomer, open])` to seed from props; the new approach uses ref-init instead, but the spirit (form seeds from external source on open) is the same.
- `src/components/ui/input.tsx` — the `Input` component already supports `readOnly` via pass-through to `<input>`.

**Test scenarios:**
- Happy path: `<AddServiceForm initial={{customerName: "Lan", customerEmail: "lan@x.com"}} disableCustomerFields />` mounts; step 1 → next; step 2 shows name `Lan` and email `lan@x.com` in `readOnly` inputs; the helper text `Đã được điền tự động từ tài khoản của bạn.` is visible below the email; submit payload contains those exact values.
- Phone override: with `disableCustomerFields=true` and `initial={{customerName: "Lan", customerEmail: "lan@x.com", customerPhone: "0123"}}`, the phone input is editable; customer clears the phone and retypes `"0456"`; submit payload has `"0456"`.
- Default behavior: `<AddServiceForm />` (no new props) renders exactly as today — empty name/email, both editable, validation still enforces non-empty on submit.
- Reset: the existing `handleReset` flow (`Đặt dịch vụ mới` button in the success screen) is preserved; the new `initial` prop is consumed at mount and not re-applied on reset.

**Verification:**
- `npm run build` passes (type-check).
- `npm run lint` is clean.
- Manual: with the page wiring the new props, step 2's name and email are pre-populated and read-only, the phone is pre-populated and editable.

---

### U2. New `OrderApi` service + Redux slice for `/orders/me` and `/orders/submit`

**Goal:** Provide the typed service layer and Redux state that the page consumes, mirroring the existing API/slice conventions (`JobApi.tsx` + `Jobs.tsx`, `CustomerApi` + `Customer.tsx`).

**Requirements:** Source request — "has history order" (driven by `GET /orders/me`).

**Dependencies:** None.

**Files:**
- Create: `src/services/OrderApi.tsx`
- Create: `src/types/orders.tsx`
- Create: `src/store/slice/orders/Orders.tsx`
- Modify: `src/store/store.tsx` (register the new slice)

**Approach:**

**Service** (`src/services/OrderApi.tsx`):
- `getMyOrders(data: { pageNumber: number; pageSize: number })` — calls `axiosInstance.get('/orders/me', { params: ... })`, returns `ApiResponse<PageResponse<OrderResponse[]>>`. Mirror `getAllJobs` in `JobApi.tsx:6-17`.
- `submitOrder(data: { body: CreateOrderRequestBody })` — calls `axiosInstance.post('/orders/submit', data.body)`, returns `ApiResponse<OrderResponse>`. Mirror `createCustomer` / `createJob` patterns.

**Types** (`src/types/orders.tsx`):
- Export `OrderResponse` mirroring `OrderResponse.java` (the Lombok `@Getter @Setter` shape: `id, code, customerName, customerEmail, customerPhone, orderNotes, status: OrderStatus, configuration: any, estimatedPrice: number | null, createdAt: string, updatedAt: string`).
- Export `OrderStatus` as a string-literal union: `"PENDING" | "REVIEWED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REJECTED"` (do NOT use a TypeScript enum — string unions match the codebase's existing convention in `types/customers.tsx` etc.).
- Export `CreateOrderRequestBody` mirroring the DTO: `{ customerName: string; customerEmail: string; customerPhone: string; orderNotes?: string; configuration: any; estimatedPrice?: number | null }`. Note: `configuration` is `any` on the frontend; the JSON payload is `application/json`, axios serializes a plain object, and the server's Jackson `@JsonNode` accepts it.
- Reuse `PageResponse<T>` from `@/components/types/Page`. Reuse `ApiResponse<T>` from `@/components/types/ApiResponse`.

**Slice** (`src/store/slice/orders/Orders.tsx`):
- State shape:
  ```ts
  interface OrdersState {
    orders: OrderResponse[];
    loading: boolean;
    error: string;
    submitting: boolean;
    submitError: string;
  }
  ```
- Thunks:
  - `getMyOrdersAction` — `createAsyncThunk<OrderResponse[], { pageNumber: number; pageSize: number }>` — calls `getMyOrders`, returns the unwrapped `response.data.data` array. On reject, stores `error`.
  - `submitOrderAction` — `createAsyncThunk<OrderResponse, CreateOrderRequestBody>` — calls `submitOrder`, returns the unwrapped `response.data`. On reject, stores `submitError`.
- Reducer cases:
  - `getMyOrdersAction.pending` → `loading=true`, clear `error`
  - `getMyOrdersAction.fulfilled` → `loading=false`, `orders = action.payload`
  - `getMyOrdersAction.rejected` → `loading=false`, `error = action.error.message`
  - `submitOrderAction.pending` → `submitting=true`, clear `submitError`
  - `submitOrderAction.fulfilled` → `submitting=false` (refetch is dispatched by the page from `extraReducers` in `unwrap().then()`)
  - `submitOrderAction.rejected` → `submitting=false`, `submitError = action.error.message`
- Default export: reducer from `createSlice`. Use `Orders.tsx` (not `Order.tsx`) to match the directory naming precedent in `src/store/slice/jobs/Jobs.tsx` etc.

**Store registration** (modify `src/store/store.tsx`):
- Import the new slice; add `order: OrdersSlice` to the `configureStore({ reducer: {...} })` block. Place it next to `customer`/`job`/`video` semantically (orders belong alongside jobs and customers).

**Patterns to follow:**
- `src/services/JobApi.tsx:6-17, 47-54` — `axiosInstance.get` + try/catch wrapper pattern; `as unknown as ApiResponse<T>` cast.
- `src/store/slice/jobs/Jobs.tsx:17-30` — `createAsyncThunk` shape; `response.data as T` unwrap.
- `src/store/slice/customer/Customer.tsx:10-60` — interface, thunk, and slice-style initial state.
- `src/store/store.tsx:6-19` — slice registration imports and reducer block.

**Test scenarios:**
- `getMyOrdersAction.fulfilled` reduces `orders` to the unwrapped list.
- `getMyOrdersAction.rejected` sets `error` and clears `loading`.
- `submitOrderAction.fulfilled` returns the `OrderResponse` (verified via `unwrap()` in the page — the slice stores `submitting=false` but does not append `orders` itself).
- Default export reducer is wired into the store (verified via `useAppSelector((state) => state.order.orders)` returning the test data).

**Verification:**
- `npm run build` passes.
- `npm run lint` is clean.
- Manual `axiosInstance.get('/orders/me')` round-trip with a CUSTOMER-role JWT (via the running dev server) returns the user's existing orders.

---

### U3. Build `OrderHistoryList` component

**Goal:** Render the customer's order list as Vietnamese-labeled cards with an empty state and a per-entry status badge.

**Requirements:** Source request — visible "history order" on the page.

**Dependencies:** U2 (the `OrderResponse` / `OrderStatus` types).

**Files:**
- Create: `src/components/services/order-history-list.tsx`

**Approach:**
- Props: `{ orders: OrderResponse[]; loading?: boolean; error?: string }`.
- Render priority:
  - If `loading && orders.length === 0` → show a small skeleton (3 muted `Card` placeholders matching the card height — optional polish; if too much, fall back to a single muted line `Đang tải lịch sử đơn hàng…`)
  - If `error && orders.length === 0` → show a destructive-tinted card: `Không thể tải lịch sử đơn hàng. {error}` (do NOT expose raw error messages from the server; trim to first sentence)
  - If `orders.length === 0` → empty-state card: muted `Inbox` or `ClipboardList` icon + text `Bạn chưa có đơn hàng nào.`
  - Otherwise → one `Card` per order, newest first (the slice already sorts DESC by `id` server-side). Each card shows:
    - Top row: order `code` (e.g., `order-1024`) on the left; the `OrderStatus` badge on the right. `code` format: monospace tailwind class `font-mono`.
    - Status badge: a small `Badge` whose variant is chosen by status — see the status→variant map below.
    - Middle row: small note `Đã tạo: {formatted createdAt}` (Vietnamese locale via `new Date(...).toLocaleString("vi-VN")`)
    - Optional bottom row (conditional): if `order.estimatedPrice != null`, show `Giá ước tính: {estimatedPrice}` formatted as VND (no currency library — use `Intl.NumberFormat("vi-VN")`).
- No per-card actions in this plan. No detail view. No "Reorder" button. Add a deferred note.
- No pagination in this plan. Customer history is small; the backend already returns up to 16 entries per call.
- Use `Card`, `Badge` from `@/components/ui/`. Match the visual weight of `src/components/services/service-card.tsx`.

**OrderStatus → Badge variant map (Vietnamese label + tailwind hint):**

| Backend status | Vietnamese label | Badge variant |
|---|---|---|
| `PENDING` | `Đang chờ` | `outline` (neutral) |
| `REVIEWED` | `Đã xem` | `secondary` |
| `CONFIRMED` | `Đã xác nhận` | `secondary` (or custom blue) |
| `IN_PROGRESS` | `Đang thực hiện` | `default` (primary) |
| `COMPLETED` | `Hoàn thành` | `default` |
| `CANCELLED` | `Đã hủy` | `destructive` |
| `REJECTED` | `Bị từ chối` | `destructive` |

If `src/components/ui/badge.tsx` does not export the desired variant, use `className` overrides (e.g., `bg-blue-100 text-blue-700 border-blue-200`) rather than introducing new shadcn variants.

**Patterns to follow:**
- `src/components/services/service-card.tsx` — card layout, hover, padding conventions
- `src/components/customers/customer-table.tsx` — empty-state messaging tone, badge usage

**Test scenarios:**
- Empty state: `orders=[]` and `loading=false` and `error=""` → renders the muted card with icon and `Bạn chưa có đơn hàng nào.`
- Loading state: `loading=true` and `orders=[]` → renders the loading line, not the empty state.
- Error state: `error="..."` and `orders=[]` → renders the error card, not the empty state.
- One order: renders one card with the order `code` (e.g., `order-1024`), the status badge label `Đang chờ`, and the formatted createdAt.
- Multiple orders in PENDING, COMPLETED, CANCELLED states: each card shows the correct Vietnamese label and variant.
- Estimated price: when `estimatedPrice` is non-null, the card shows the formatted VND line; when null, the line is omitted.

**Verification:**
- `npm run build` passes.
- Manual: with a CUSTOMER who has 0 orders, see the empty state; with one submitted order, see it in the list; with several orders in different statuses, see the badge variants.

---

### U4. Rewrite `order-service/page.tsx` as a customer hub

**Goal:** Compose the history list (U3), the "Đặt dịch vụ mới" button, and the form modal (U1) into one customer-facing page, wired to the API/slice from U2.

**Requirements:** Source request — full hub: history, button, opened form, auth-derived auto-fill.

**Dependencies:** U1, U2, U3.

**Files:**
- Modify: `src/app/dashboard/order-service/page.tsx`

**Approach:**
- Keep `"use client"` (already on line 1 — the page needs hooks and dispatch).
- State and selectors:
  - `useAppSelector((state) => state.authenticate)` — destructure `{ fullName, email, phoneNumber, roleName }`.
  - `useAppSelector((state) => state.order)` — destructure `{ orders, loading, error, submitting, submitError }`.
  - `useAppDispatch()` — for action dispatch.
  - `useState<boolean>(openForm)` for dialog visibility.
- On mount: `useEffect(() => { dispatch(getMyOrdersAction({ pageNumber: 0, pageSize: 16 })); }, [dispatch]);` — refetches on every mount. Skip a focus/visibility refetch in this iteration (deferred — see Deferred to Follow-Up Work).
- Render order:
  1. Page header (preserve current `Đặt Dịch Vụ` title + Vietnamese description)
  2. **CUSTOMER-only block** (`{roleName === "CUSTOMER" && (...)}`):
     - `<OrderHistoryList orders={orders} loading={loading} error={error} />`
     - `<Button onClick={() => setOpenForm(true)}>Đặt dịch vụ mới</Button>` (primary variant; same visual weight as the form's submit button so customers see the parallel CTA)
     - `<Dialog open={openForm} onOpenChange={setOpenForm}>` containing `<AddServiceForm initial={...} disableCustomerFields onSubmit={handleFormSubmit} />`
  3. **Non-CUSTOMER fallback** (`{roleName !== "CUSTOMER" && <AddServiceForm />}`): preserve current inline `<AddServiceForm />` so non-CUSTOMER roles (managers testing the route) still see the form. No history, no button, no auto-fill.
- Form submit handler:
  - Build `body: CreateOrderRequestBody` from `AddServiceFormState`:
    - `customerName`, `customerEmail`, `customerPhone` — pulled from form state. The auth-derived pre-fill writes into those fields; the user may have overridden the phone.
    - `orderNotes` — `formState.orderNotes` (form's free-text notes).
    - `configuration` — `JSON.parse(JSON.stringify(formState))` to produce a plain object (the form's `useRef` state may include non-serializable DOM event artifacts; round-tripping through `JSON` strips them and ensures axios sends `application/json`).
    - `estimatedPrice` — `null` (this plan does not surface pricing in the form).
  - Dispatch `submitOrderAction(body).unwrap()`:
    - On success: `setOpenForm(false); toast.success("Đơn hàng đã được gửi thành công!"); dispatch(getMyOrdersAction({ pageNumber: 0, pageSize: 16 }));`
    - On error: `toast.error(err.message || "Không thể gửi đơn hàng. Vui lòng thử lại.");` — leave the dialog open; the customer can retry.
- Only render `initial` when both `fullName` and `email` are non-empty (defensive — empty readOnly inputs would block `validateStep2`). Wrap with `useMemo` keyed on `[fullName, email, phoneNumber]` to avoid re-creating the object on every render (per `spec/FORM_PERFORMANCE_FIXES.md`).
- When `disableCustomerFields` is `true` and `initial?.customerPhone` is set, the phone input shows the auth phone pre-filled; the customer may edit before submit.

**Patterns to follow:**
- `src/components/dashboard/sidebar.tsx:34, 37` — `useAppSelector` destructuring + uppercase `roleName` comparison.
- `src/components/customers/customer-form.tsx:78-89` — Dialog composition (`<Dialog open onOpenChange><DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">`).
- `src/app/dashboard/jobs/page.tsx` — `useEffect` for initial fetch on mount.
- `spec/ADD_SERVICE_FORM_PLAN.md` — Vietnamese copy conventions.

**Test scenarios:**
- Render path: page mounts as CUSTOMER, `useEffect` dispatches `getMyOrdersAction`, and the list reflects the slice's `orders` field. If the dispatch fails, `error` is set and the list shows the error state (not the empty state).
- Empty CUSTOMER: page shows the empty-state list, the "Đặt dịch vụ mới" button, no dialog.
- CUSTOMER + open dialog: click the button → dialog opens with name and email pre-populated + readOnly and phone pre-populated + editable. The other fields are unconstrained and editable.
- CUSTOMER + submit: fill the form, submit; thunk makes a real `POST /orders/submit` call; on 200 the dialog closes, the toast fires, and the list refetches and shows the new order at the top.
- CUSTOMER + submit failure: a 400 from the server (e.g., missing required field if the form is incomplete) triggers an error toast; the dialog stays open so the customer can correct.
- Non-CUSTOMER: the history section is hidden, the "Đặt dịch vụ mới" button is hidden, and the inline `<AddServiceForm />` still renders (current dev workflow preserved).
- Phone override: a CUSTOMER with `state.phoneNumber="0123"` clicks the button, sees the phone pre-filled in step 2, edits it to `"0456"`, submits; the saved order's `customerPhone` mirrors the Account value (server ignores the body), and the request body's `customerPhone` field is `"0456"`. This is the expected coupling — document in the page handler with a comment.

**Verification:**
- `npm run build` passes (type-check).
- `npm run lint` is clean.
- Manual end-to-end: log in as CUSTOMER, visit `/dashboard/order-service`, see empty state, click the button, confirm name/email auto-populate and are read-only, fill the form, submit, see the new order in the history list, reload the page, confirm the order persists (it lives on the server now, not in localStorage).

---

## Scope Boundaries

### In Scope
- Two new optional props on `AddServiceForm` (`initial?`, `disableCustomerFields?`) plus the read-only enforcement in `ServiceDetailsStep`
- New `OrderApi` service, `Orders` Redux slice, and `store.tsx` registration
- New `OrderHistoryList` component (cards, empty state, status badges, no actions)
- New `src/types/orders.tsx` with `OrderResponse`, `OrderStatus`, `CreateOrderRequestBody`
- Rewrite of `order-service/page.tsx` as a customer hub: history section, primary button, dialog-wrapped form
- Vietnamese copy for all new user-facing strings

### Deferred to Follow-Up Work
- **Per-order actions in `OrderHistoryList`**: "Xem chi tiết" (use `GET /orders/{id}` — not yet implemented server-side; the backend plan defers it to a follow-up), "Hủy đơn hàng" (would need `DELETE /orders/{id}` and an `AlertDialog` confirmation). The component already accepts `orders` as a prop; adding actions later is additive.
- **Pagination / search on the history list**: Backend already returns paged results, but the frontend only shows page 1 (size 16). When a customer accumulates more than ~16 orders, add a `Pagination` component from `src/components/jobs/pagination.tsx` and re-dispatch `getMyOrdersAction` on page change. The thunk already accepts `{pageNumber, pageSize}`.
- **On-focus refetch**: When the tab returns to the foreground or the customer navigates back to the page, refetch the history (to reflect admin status updates from another tab). Use `document.addEventListener('visibilitychange', ...)` inside the page `useEffect`. Cheap, additive.
- **Phone auto-fill enforcement**: The plan pre-fills `customerPhone` from `state.phoneNumber` but lets the customer override. If the team wants the phone equally locked, add it to `disableCustomerFields` (U1).
- **Polish the loading state**: The skeleton-cards polish in U3 is optional; if the implementer prefers a flat `Đang tải…` line, that's acceptable.
- **Status badge visual variants**: The map in U3 lists defaults. The implementer can refine the palette during implementation based on visual review.
- **Order-to-fulfilment handoff** (covered by the parent backend plan's "Out of scope"): turning an `Order` into `Job` rows. Not a frontend concern yet.
- **Notifications on order status change**: Customer should get a notification when admin moves the order's status. The `FetchNotificationsAction` already runs in the dashboard layout; the emission side is a backend concern (covered in backend deferred notes).

### Non-Goals
- **Customer-scoped routing changes**: Sidebar already restricts CUSTOMER nav to this single route (`sidebar.tsx:37`). No new routes are added.
- **Admin dashboard for orders**: Out of scope. The customer surface ships first per the user's instruction.
- **i18n infrastructure**: Vietnamese is the de facto language across the app. A formal i18n initiative is unrelated.
- **Test runner**: The repo has no test runner. Verification is manual. Adding a runner is a separate team-level decision.
- **Backend changes**: All endpoints already exist. This plan consumes them as-is, including the `customerPhone` `@NotBlank` redundancy noted in the Key Technical Decisions.

---

## Dependencies & Sequencing

- **U1** has no dependencies; can ship first in isolation (does nothing visible without U4 wiring)
- **U2** has no dependencies; can ship first in isolation (service + slice are unused until U4 imports them)
- **U3** depends on U2 (the `OrderResponse` and `OrderStatus` types from `types/orders.tsx`)
- **U4** depends on U1, U2, U3

Recommended landing order: U1 → U2 → U3 → U4 in one feature branch (or split as U1+U2 in commit 1 and U3+U4 in commit 2). Splitting is not required for correctness — all four units are needed for the visible behavior.

No backend changes are required — this plan is fully a frontend change that consumes the existing endpoints.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `@NotBlank customerPhone` in the DTO requires a non-blank phone on submit, but the user has none | High | Medium | The page sends the auth phone when available, else the form's typed phone, else a sentinel like `"unspecified"`. The server mirrors the saved phone from `Account.phoneNumber` anyway — see `OrderServiceImpl.submitOrder:67`. The constraint is a DTO schema defense, not an authoritative check. Document the workaround in the page handler with a comment. |
| The `OrderStatus` enum grows new values server-side that the frontend doesn't list | Low | Low | U3's `status.toString()` falls through the map to a default badge. The render code uses a switch statement (or a plain object `Map`) — easy to extend. |
| `GET /orders/me` returns more than 16 orders (acceptable for early stage) and the UI truncates silently | Medium | Low | The backend response includes `totalElements`; the implementer can render a footer note `Hiển thị 16 trên {totalElements} đơn hàng` (optional polish, deferred). |
| `useRef` initializer runs on every re-render in StrictMode, double-firing the merge and producing surprising `initial` values | Low | Low | The initializer is a pure expression. React StrictMode double-invokes it but produces the same output. The form's `forceUpdate` reducer is unaffected. |
| The `configuration` JsonNode round-trip (`JSON.parse(JSON.stringify(formState))`) drops `null` / `undefined` differences | Low | Low | The round-trip is an intentional normalization — anything that can't survive `JSON.stringify` is by definition not part of the saved form state. The form's pre-JSON state contains only strings, arrays of strings, and booleans (per `AddServiceFormState`). |
| A customer who registered without a phone signs in and the auto-filled phone is empty, failing `@NotBlank` | High | Medium | Same mitigation as the first row: the page handler always sends a non-blank string in `customerPhone`. The server-mirrored value (`Account.phoneNumber`) is whatever was on the Account at login time — if empty, the saved order's phone is `""`. Document this in the page handler. |
| Auto-fill applied only to CUSTOMER role breaks the existing dev workflow for managers testing the route | Low | Low | U4 keeps the inline `<AddServiceForm />` for non-CUSTOMER. Managers see the form as before. |
| The new Redux slice is not registered in `store.tsx` and the page silently shows empty state | Medium | Medium | U2 includes the store-registration step. Manual verification covers this. Add a one-line smoke check (dev console: `store.getState().order`) in U2's verification. |

---

## Deferred Implementation Notes

- **Exact status-badge color tokens** depend on the design tokens in `src/components/ui/badge.tsx`. Use the default variants; refine visually during implementation.
- **Date formatting**: `toLocaleString("vi-VN")` produces `02/07/2026 14:30:00` on most browsers. If the team prefers no seconds (`02/07/2026 14:30`), wrap with a custom formatter (split on space, take `[0, 1]`). Defer to implementer.
- **`configuration` schema shape**: The frontend sends the full `AddServiceFormState` as the configuration object. The server persists it verbatim. If a future admin dashboard wants typed fields per service, the JSON-schema will need to be defined once and shared between frontend and backend. Not in scope now.
- **`estimatedPrice` field**: Frontend sends `null` today. When the admin backend surfaces pricing workflows, the form needs an estimated-price input — deferred.
- **Reorder** ("Đặt lại đơn này" action in the history list): would pre-fill a new form from a saved order's `configuration`. Add later when the U3 component grows per-card actions.

---

## Related Plans

- `jobmanagement/docs/plans/2026-07-02-001-feat-order-service-crud-plan.md` — the backend plan that ships `controller/orders/CustomerOrderController.java` and its DTOs/entity/service. This frontend plan is a strict consumer of that surface.
- `job-management-app/docs/plans/2026-06-26-001-feat-google-oauth-auth-plan.md` — adds the CUSTOMER role, the `Account.googleSub`/`pictureUrl` columns, and the Google callback shape. Both plans share the assumption that `state.authenticate.{fullName,email,phoneNumber,roleName}` is the single customer identity source on the frontend.
- `job-management-app/spec/ADD_SERVICE_FORM_PLAN.md` — establishes the form's `useRef + useReducer` convention, the Vietnamese label tone, and the "no new dependencies" rule. U1 honors all three.
