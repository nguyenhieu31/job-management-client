# Employee Management Page - Documentation

## Overview
This document describes the Employee CRUD (Create, Read, Update, Delete) page implementation based on the Job Management page structure, but simplified for employee management.

## Location
- **Page**: `/src/app/dashboard/employees/page.tsx`
- **Route**: `/dashboard/employees`

## Components Created

### 1. Type Definitions (`/src/types/employees.tsx`)
Extended with:
- `EmployeeFilters`: Interface for filtering employees
  - `search`: Search by name, email, or phone number
- `EmployeePagination`: Interface for pagination state
  - `currentPage`, `pageSize`, `totalItems`, `totalPages`

### 2. EmployeeFilterBar (`/src/components/employees/employee-filter-bar.tsx`)
Simple filter component with:
- **Search input**: Search by name, email, or phone number
- **Apply button**: Apply filters
- **Reset button**: Clear all filters

Layout: 3-column responsive grid (md:2, lg:3)

### 3. EmployeeForm (`/src/components/employees/employee-form.tsx`)
Modal form for creating/editing employees with fields:
- **Code**: Employee code (e.g., EMP-001)
- **Email**: Employee email address
- **Full Name**: Employee full name
- **Date of Birth**: Date picker for DOB
- **Phone Number**: Phone number input
- **Role**: Dropdown selector (Manager, Employee, QA)
- **Is Active**: Checkbox for active status

Features:
- Auto-populate form when editing
- Validation (all fields required)
- Scrollable dialog for mobile responsiveness

### 4. EmployeeTable (`/src/components/employees/employee-table.tsx`)
Table displaying employee information with columns:
- **Code**: Employee identifier
- **Email**: Contact email
- **Full Name**: Display name
- **Date of Birth**: Formatted date
- **Phone Number**: Contact number
- **Role**: Badge showing role (Manager/Employee/QA)
- **Status**: Badge showing Active (green) or Inactive (gray)
- **Actions**: Edit and Delete buttons

Features:
- Edit button: Opens form in edit mode
- Delete button: Shows confirmation dialog
- Empty state when no employees found
- Color-coded badges for status visualization

### 5. EmployeesPage (`/src/app/dashboard/employees/page.tsx`)
Main page integrating all components with:
- **Header**: Title, description, and Add Employee button (Manager only)
- **Filter bar**: Search functionality
- **Employee table**: Display filtered employees
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
- **Create**: Add new employee (Manager only)
- **Read**: View all employees with filtering and pagination
- **Update**: Edit employee information
- **Delete**: Remove employee with confirmation dialog

### Role-Based Access
- **Add Employee button**: Only visible to Manager role
- **All other actions**: Available based on backend permissions

## State Management

### Local State
```typescript
const [formOpen, setFormOpen] = useState(false);
const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);
const [filters, setFilters] = useState<EmployeeFilters>({ search: "" });
const [appliedFilters, setAppliedFilters] = useState<EmployeeFilters>(filters);
const [pagination, setPagination] = useState<EmployeePagination>({
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
  - `employee`: Employee data and loading state

## API Integration (TODO)

Currently using placeholder functions. Implement the following:

### Create Employee
```typescript
// In handleAddEmployee when employee.id is undefined
// POST /api/employees
```

### Update Employee
```typescript
// In handleAddEmployee when employee.id exists
// PUT /api/employees/:id
```

### Delete Employee
```typescript
// In handleDeleteEmployee
// DELETE /api/employees/:id
```

### Fetch Employees
```typescript
// Already implemented
dispatch(GetAllEmployeesAction({
  pageNumber: pagination.currentPage - 1,
  pageSize: pagination.pageSize,
}));
```

## Data Flow

1. **Page Load**:
   - Check user role
   - Fetch employees from API
   - Initialize pagination

2. **Apply Filters**:
   - User enters search term
   - Clicks Apply button
   - Filters applied to employee list
   - Pagination resets to page 1

3. **Create Employee**:
   - Manager clicks "Add Employee"
   - Form opens with empty fields
   - User fills in information
   - Submit creates new employee
   - API call made
   - Employee list refreshed

4. **Edit Employee**:
   - User clicks Edit icon
   - Form opens with pre-filled data
   - User modifies information
   - Submit updates employee
   - API call made
   - Employee list refreshed

5. **Delete Employee**:
   - User clicks Delete icon
   - Confirmation dialog appears
   - User confirms deletion
   - API call made
   - Employee list refreshed

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Responsive**: Mobile-first design with breakpoints
- **Color-coded badges**: 
  - Active: Green (bg-green-100)
  - Inactive: Gray (bg-gray-100)
  - Role: Outline variant

## Key Differences from Job Page

### Simplified Features
- ✅ No complex status workflow
- ✅ No action buttons (Take Job, Done Job, etc.)
- ✅ Simpler filtering (only search)
- ✅ No editable inline fields
- ✅ Standard CRUD only

### Similar Features
- ✅ Pagination with same component
- ✅ Role-based access control
- ✅ Two-stage filtering
- ✅ Redux integration
- ✅ Loading states
- ✅ Toast notifications

## Testing Checklist

### Manager Role
- [ ] Can see "Add Employee" button
- [ ] Can create new employee
- [ ] Can edit employee
- [ ] Can delete employee
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Can change page size

### Non-Manager Roles
- [ ] Cannot see "Add Employee" button
- [ ] Can view employee list
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Edit/Delete depend on backend permissions

## Future Enhancements

1. **Advanced Filtering**:
   - Filter by role
   - Filter by active/inactive status
   - Date range for date of birth

2. **Bulk Operations**:
   - Bulk activate/deactivate
   - Bulk delete with confirmation

3. **Export**:
   - Export to CSV
   - Export to Excel

4. **Employee Details**:
   - Detailed view page
   - Show assigned jobs
   - Show performance metrics

5. **Audit Trail**:
   - Track who created/modified employees
   - Show creation and modification timestamps

6. **Search Enhancements**:
   - Fuzzy search
   - Search suggestions
   - Recent searches

## Notes

- All API calls currently have placeholder implementations marked with `// TODO`
- Toast notifications are ready but need backend integration
- Form validation is basic (required fields only)
- Date formatting uses `en-US` locale, adjust as needed
- Role list is hardcoded, consider fetching from API
