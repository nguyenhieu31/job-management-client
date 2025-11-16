# Customer Management Page - Documentation

## Overview
This document describes the Customer CRUD (Create, Read, Update, Delete) page implementation based on the Employee Management page structure, simplified for customer management.

## Location
- **Page**: `/src/app/dashboard/customers/page.tsx`
- **Route**: `/dashboard/customers`

## Components Created

### 1. Type Definitions (`/src/types/customers.tsx`)
Extended with:
- `CustomerFilters`: Interface for filtering customers
  - `search`: Search by name, email, or phone number
- `CustomerPagination`: Interface for pagination state
  - `currentPage`, `pageSize`, `totalItems`, `totalPages`

### 2. CustomerFilterBar (`/src/components/customers/customer-filter-bar.tsx`)
Simple filter component with:
- **Search input**: Search by name, email, or phone number
- **Apply button**: Apply filters
- **Reset button**: Clear all filters

Layout: 3-column responsive grid (md:2, lg:3)

### 3. CustomerForm (`/src/components/customers/customer-form.tsx`)
Modal form for creating/editing customers with fields:
- **Email**: Customer email address
- **Full Name**: Customer full name
- **Phone Number**: Phone number input
- **Company**: Company name

Features:
- Auto-populate form when editing
- Validation (all fields required)
- Scrollable dialog for mobile responsiveness
- Clean and simple layout

### 4. CustomerTable (`/src/components/customers/customer-table.tsx`)
Table displaying customer information with columns:
- **Email**: Contact email
- **Full Name**: Display name
- **Phone Number**: Contact number
- **Company**: Company name
- **Actions**: Edit and Delete buttons

Features:
- Edit button: Opens form in edit mode
- Delete button: Shows confirmation dialog
- Empty state when no customers found
- Clean table layout with 5 columns

### 5. CustomersPage (`/src/app/dashboard/customers/page.tsx`)
Main page integrating all components with:
- **Header**: Title, description, and Add Customer button (Manager only)
- **Filter bar**: Search functionality
- **Customer table**: Display filtered customers
- **Pagination**: Page navigation and size selector

## Features

### Filtering
- **Search**: Filter by name, email, or phone number (case-insensitive)
- **Two-stage filtering**: UI filters vs applied filters (prevents excessive re-renders)
- **Reset**: Clear all filters with one click

### Pagination
- **Page size options**: 10, 20, 50, 100 items per page
- **Navigation**: First, Previous, Next, Last buttons
- **Display**: Shows "Showing X-Y of Z items"
- **Disabled states**: Boundary pages disabled appropriately

### CRUD Operations
- **Create**: Add new customer (Manager only)
- **Read**: View all customers with filtering and pagination
- **Update**: Edit customer information
- **Delete**: Remove customer with confirmation dialog

### Role-Based Access
- **Add Customer button**: Only visible to Manager role
- **All other actions**: Available based on backend permissions

## State Management

### Local State
```typescript
const [formOpen, setFormOpen] = useState(false);
const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
const [filters, setFilters] = useState<CustomerFilters>({ search: "" });
const [appliedFilters, setAppliedFilters] = useState<CustomerFilters>(filters);
const [pagination, setPagination] = useState<CustomerPagination>({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
});
```

### Redux Integration
- **useAppDispatch**: Dispatch Redux actions
- **useAppSelector**: Select data from Redux store
  - `authenticate`: User role information
  - `customer`: Customer data and loading state

## API Integration (TODO)

Currently using placeholder functions. Implement the following:

### Create Customer
```typescript
// In handleAddCustomer when customer.id is undefined
// POST /api/customers
```

### Update Customer
```typescript
// In handleAddCustomer when customer.id exists
// PUT /api/customers/:id
```

### Delete Customer
```typescript
// In handleDeleteCustomer
// DELETE /api/customers/:id
```

### Fetch Customers
```typescript
// Already implemented
dispatch(GetAllCustomersAction({
  pageNumber: pagination.currentPage - 1,
  pageSize: pagination.pageSize,
}));
```

## Data Flow

1. **Page Load**:
   - Check user role
   - Fetch customers from API
   - Initialize pagination

2. **Apply Filters**:
   - User enters search term
   - Clicks Apply button
   - Filters applied to customer list
   - Pagination resets to page 1

3. **Create Customer**:
   - Manager clicks "Add Customer"
   - Form opens with empty fields
   - User fills in information
   - Submit creates new customer
   - API call made
   - Customer list refreshed

4. **Edit Customer**:
   - User clicks Edit icon
   - Form opens with pre-filled data
   - User modifies information
   - Submit updates customer
   - API call made
   - Customer list refreshed

5. **Delete Customer**:
   - User clicks Delete icon
   - Confirmation dialog appears
   - User confirms deletion
   - API call made
   - Customer list refreshed

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Responsive**: Mobile-first design with breakpoints
- **Clean table layout**: 5 columns with proper spacing

## Key Features

### Simplified Design
- ✅ Only 4 fields in form (email, name, phone, company)
- ✅ Simple search filter only
- ✅ No complex status or role management
- ✅ Straightforward CRUD operations
- ✅ Clean table with essential information only

### Similar to Employee Page
- ✅ Pagination with same component
- ✅ Role-based access control
- ✅ Two-stage filtering
- ✅ Redux integration
- ✅ Loading states
- ✅ Toast notifications
- ✅ Confirmation dialogs

## Testing Checklist

### Manager Role
- [ ] Can see "Add Customer" button
- [ ] Can create new customer
- [ ] Can edit customer
- [ ] Can delete customer
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Can change page size

### Non-Manager Roles
- [ ] Cannot see "Add Customer" button
- [ ] Can view customer list
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Edit/Delete depend on backend permissions

## Future Enhancements

1. **Advanced Filtering**:
   - Filter by company
   - Filter by date added
   - Sort by columns (name, email, company)

2. **Bulk Operations**:
   - Bulk delete with confirmation
   - Bulk export

3. **Export**:
   - Export to CSV
   - Export to Excel
   - Print customer list

4. **Customer Details**:
   - Detailed view page
   - Show assigned jobs
   - Show order history
   - Contact history

5. **Audit Trail**:
   - Track who created/modified customers
   - Show creation and modification timestamps
   - Track customer interactions

6. **Search Enhancements**:
   - Fuzzy search
   - Search suggestions
   - Recent searches
   - Advanced search filters

7. **Customer Insights**:
   - Total jobs by customer
   - Revenue by customer
   - Customer activity timeline

## Comparison with Employee Page

### Customer Page Features
- 4 fields: email, name, phone, company
- No roles or status
- Simple table with 5 columns
- Straightforward CRUD

### Employee Page Features
- 7 fields: code, email, name, dob, phone, role, isActive
- Role management
- Active/Inactive status badges
- More complex table with 8 columns

### Both Pages Share
- Same pagination component
- Same filter bar pattern
- Same form dialog pattern
- Same Redux integration
- Same role-based access control

## Notes

- All API calls currently have placeholder implementations marked with `// TODO`
- Toast notifications are ready but need backend integration
- Form validation is basic (required fields only)
- Currently reusing the `Pagination` component from the jobs module
- Role check uses `roleName === "MANAGER"` for consistency
- Search is case-insensitive and matches partial strings
- Customer list is fetched from Redux store using `GetAllCustomersAction`

## File Structure

```
src/
├── app/
│   └── dashboard/
│       └── customers/
│           └── page.tsx          # Main customers page
├── components/
│   └── customers/
│       ├── customer-filter-bar.tsx   # Filter component
│       ├── customer-form.tsx          # Create/Edit form
│       └── customer-table.tsx         # Table component
└── types/
    └── customers.tsx              # Customer types (extended)
```

## Access the Page

Navigate to: `/dashboard/customers`

The page integrates seamlessly with your existing dashboard layout and follows the same patterns as the Employee and Job pages.
