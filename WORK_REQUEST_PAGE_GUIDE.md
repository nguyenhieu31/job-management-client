# Work Request Management Page - Documentation

## Overview
This document describes the Work Request CRUD (Create, Read, Update, Delete) page implementation based on the Employee Management page structure. This page manages different work request styles with detailed instructions, sample links, and specifications.

## Location
- **Page**: `/src/app/dashboard/work-requests/page.tsx`
- **Route**: `/dashboard/work-requests`

## Purpose
This page is designed to manage various work request types/styles such as:
- Multi Exposure RKe
- Multi Exposure xkh
- Single Shot Standard
- And other custom work styles

Each record represents a specific style with instructions, sample links, file type requirements, and color notes.

## Components Created

### 1. Type Definitions (`/src/types/work-requests.tsx`)
Complete interface for work requests:
- `WorkRequestResponse`: Main interface with all fields
  - `id`: Unique identifier (auto-increment)
  - `categoryName`: Style name (e.g., "Multi Exposure RKe")
  - `summaryNote`: Brief description (e.g., "Sáng sạch đều màu")
  - `detailedNotes`: Detailed instructions (multi-line text)
  - `linkSample`: Sample link (e.g., "https://byvn.net/1auK")
  - `fileType`: Required file format (e.g., "TIFF")
  - `colorNote`: Color correction notes (multi-line text)
  - `createdAt`: Creation timestamp (optional)
  - `updatedAt`: Last update timestamp (optional)
- `WorkRequestFilters`: Interface for filtering
  - `search`: Search by category name or file type
- `WorkRequestPagination`: Interface for pagination state
  - `currentPage`, `pageSize`, `totalItems`, `totalPages`

### 2. WorkRequestFilterBar (`/src/components/work-requests/work-request-filter-bar.tsx`)
Simple filter component with:
- **Search input**: Search by category name or file type
- **Apply button**: Apply filters
- **Reset button**: Clear all filters

Layout: 3-column responsive grid (md:2, lg:3)

### 3. WorkRequestForm (`/src/components/work-requests/work-request-form.tsx`)
Modal form for creating/editing work requests with fields:

**Single-line inputs:**
- **Category Name** (required): Work style name
- **Summary Note** (required): Brief description
- **Link Sample** (required): URL to sample work
- **File Type** (required): Required file format

**Multi-line textareas:**
- **Detailed Notes** (required): Complete instructions (6 rows)
- **Color Note** (required): Color correction guidelines (3 rows)

Features:
- Auto-populate form when editing
- All fields required for completeness
- Textarea with `resize-none` for consistent layout
- Scrollable dialog (600px wide, 90vh max height)
- Helper text for detailed notes
- URL validation for link sample

### 4. WorkRequestTable (`/src/components/work-requests/work-request-table.tsx`)
Table displaying work request information with columns:
- **Category Name**: Style name
- **Summary Note**: Brief description (truncated at 50 chars)
- **Detailed Notes**: Instructions preview (truncated at 60 chars)
- **Link Sample**: Clickable link with external icon
- **File Type**: Badge showing format
- **Color Note**: Color info preview (truncated at 40 chars)
- **Actions**: Edit and Delete buttons

Features:
- Text truncation with `truncateText()` helper function
- External link with icon opens in new tab
- File type displayed as outline badge
- Edit button: Opens form in edit mode
- Delete button: Shows confirmation dialog
- Empty state when no work requests found
- Muted text color for previews
- Responsive column widths with max-width constraints

### 5. WorkRequestsPage (`/src/app/dashboard/work-requests/page.tsx`)
Main page integrating all components with:
- **Header**: Title, description, and Add Work Request button (Manager only)
- **Filter bar**: Search functionality
- **Work request table**: Display filtered work requests
- **Pagination**: Page navigation and size selector
- **Demo data**: 3 sample work requests included

## Features

### Filtering
- **Search**: Filter by category name or file type (case-insensitive)
- **Two-stage filtering**: UI filters vs applied filters (prevents excessive re-renders)
- **Reset**: Clear all filters with one click

### Pagination
- **Client-side pagination**: Filters and paginates demo data
- **Page size options**: 10, 20, 50, 100 items per page
- **Navigation**: First, Previous, Next, Last buttons
- **Display**: Shows "Showing X-Y of Z items"
- **Disabled states**: Boundary pages disabled appropriately
- **Auto-update**: Total pages calculated based on filtered results

### CRUD Operations
- **Create**: Add new work request style (Manager only)
- **Read**: View all work requests with filtering and pagination
- **Update**: Edit work request information with timestamp
- **Delete**: Remove work request with confirmation dialog

### Role-Based Access
- **Add Work Request button**: Only visible to Manager role
- **All other actions**: Currently available to all roles (can be restricted)

## State Management

### Local State
```typescript
const [workRequests, setWorkRequests] = useState<WorkRequestResponse[]>(initialWorkRequests);
const [formOpen, setFormOpen] = useState(false);
const [editingWorkRequest, setEditingWorkRequest] = useState<WorkRequestResponse | null>(null);
const [loading] = useState(false);
const [filters, setFilters] = useState<WorkRequestFilters>({ search: "" });
const [appliedFilters, setAppliedFilters] = useState<WorkRequestFilters>(filters);
const [pagination, setPagination] = useState<WorkRequestPagination>({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
});
```

### Redux Integration
- **useAppSelector**: Select user role from authentication state
  - `authenticate.roleName`: Used for role-based UI rendering

### Demo Data
Includes 3 sample work requests:
1. **Multi Exposure RKe** - TIFF format with fill lighting instructions
2. **Multi Exposure xkh** - TIFF format with HDR processing instructions
3. **Single Shot Standard** - JPEG format with basic color correction

## Data Flow

1. **Page Load**:
   - Initialize with demo data
   - Check user role
   - Set initial pagination

2. **Apply Filters**:
   - User enters search term
   - Clicks Apply button
   - Filters applied to work request list
   - Pagination updates (total items, total pages)
   - Current page resets to 1

3. **Create Work Request**:
   - Manager clicks "Add Work Request"
   - Form opens with empty fields
   - User fills in all 6 required fields
   - Submit creates new work request
   - Auto-generate ID and timestamps
   - List updates with new item
   - Toast notification shown

4. **Edit Work Request**:
   - User clicks Edit icon
   - Form opens with pre-filled data
   - User modifies information
   - Submit updates work request
   - UpdatedAt timestamp updated
   - List refreshes
   - Toast notification shown

5. **Delete Work Request**:
   - User clicks Delete icon
   - Confirmation dialog shows category name
   - User confirms deletion
   - Item removed from list
   - Toast notification shown

6. **Pagination**:
   - User changes page or page size
   - View updates to show correct slice of data
   - Navigation buttons enable/disable appropriately

## API Integration (TODO)

Currently using client-side state. For backend integration:

### Create Work Request
```typescript
// In handleAddWorkRequest when workRequest.id is undefined
// POST /api/work-requests
{
  categoryName: string,
  summaryNote: string,
  detailedNotes: string,
  linkSample: string,
  fileType: string,
  colorNote: string
}
```

### Update Work Request
```typescript
// In handleAddWorkRequest when workRequest.id exists
// PUT /api/work-requests/:id
{
  categoryName: string,
  summaryNote: string,
  detailedNotes: string,
  linkSample: string,
  fileType: string,
  colorNote: string
}
```

### Delete Work Request
```typescript
// In handleDeleteWorkRequest
// DELETE /api/work-requests/:id
```

### Fetch Work Requests
```typescript
// Add to useEffect on component mount
// GET /api/work-requests?page=0&size=10&search=...
```

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Responsive**: Mobile-first design with breakpoints
- **Text Truncation**: Long text truncated with ellipsis
- **Max Width**: Constrained columns for better readability
- **External Link Styling**: Blue text with hover effects
- **Badge**: Outline variant for file type

## Key Features

### Rich Text Support
- ✅ Multi-line textarea for detailed notes (6 rows)
- ✅ Multi-line textarea for color notes (3 rows)
- ✅ `resize-none` to prevent layout issues
- ✅ Helper text for user guidance

### URL Handling
- ✅ URL validation on link sample field
- ✅ Clickable external links in table
- ✅ Opens in new tab with security attributes
- ✅ External link icon for visual clarity

### Data Presentation
- ✅ Text truncation for long content
- ✅ Badge for file type
- ✅ Muted colors for secondary information
- ✅ Tooltips could be added for full text (future enhancement)

### Similar to Employee Page
- ✅ Pagination with same component
- ✅ Role-based access control
- ✅ Two-stage filtering
- ✅ Loading states ready
- ✅ Toast notifications
- ✅ Confirmation dialogs

## Testing Checklist

### Manager Role
- [ ] Can see "Add Work Request" button
- [ ] Can create new work request
- [ ] Can edit work request
- [ ] Can delete work request
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Can change page size
- [ ] All fields validate correctly
- [ ] Link opens in new tab

### Non-Manager Roles
- [ ] Cannot see "Add Work Request" button
- [ ] Can view work request list
- [ ] Can filter by search
- [ ] Can navigate pages
- [ ] Can click sample links
- [ ] Edit/Delete available (can be restricted)

### Data Validation
- [ ] All fields required
- [ ] URL format validated for link sample
- [ ] Long text truncated properly in table
- [ ] Timestamps auto-generated
- [ ] ID auto-incremented

## Example Data Structure

```typescript
{
  id: 1,
  categoryName: "Multi Exposure RKe",
  summaryNote: "Sáng sạch đều màu (Fill đèn tivi)",
  detailedNotes: "Ảnh phải đảm bảo sáng đều, không có bóng đổ. Sử dụng fill đèn để cân bằng ánh sáng...",
  linkSample: "https://byvn.net/1auK",
  fileType: "TIFF",
  colorNote: "Trừ trắng hay xám đều tăng 3 tem, giữ nguyên tone màu gốc",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Future Enhancements

1. **Advanced Filtering**:
   - Filter by file type dropdown
   - Filter by date created
   - Sort by category name, date

2. **Rich Text Editor**:
   - Markdown support for detailed notes
   - Preview mode
   - Code highlighting for technical instructions

3. **Image Preview**:
   - Embed sample images
   - Image gallery
   - Before/after comparisons

4. **Bulk Operations**:
   - Bulk delete with confirmation
   - Bulk export

5. **Export**:
   - Export to PDF with formatting
   - Export to Excel
   - Print-friendly version

6. **Versioning**:
   - Track changes to instructions
   - Version history
   - Restore previous versions

7. **Templates**:
   - Quick create from template
   - Template categories
   - Common instructions library

8. **Search Enhancements**:
   - Full-text search in all fields
   - Search suggestions
   - Recent searches
   - Advanced search filters

9. **File Type Management**:
   - File type dropdown instead of text input
   - Predefined file types (TIFF, JPEG, PNG, RAW)
   - File type icons

10. **Color Management**:
    - Color picker integration
    - Visual color notes
    - Color profile suggestions

## Comparison with Employee Page

### Work Request Page Features
- 6 required fields with rich text support
- Multi-line textareas for instructions
- External link handling
- Text truncation in table
- File type badge display
- Demo data included
- Client-side CRUD operations

### Employee Page Features
- 7 fields with date picker and checkbox
- Role dropdown selector
- Active/Inactive status badges
- Date formatting
- Redux integration for API calls

### Both Pages Share
- Same pagination component
- Same filter bar pattern
- Same form dialog pattern
- Same role-based access control
- Same confirmation dialogs
- Same toast notifications

## Notes

- Currently using client-side state management
- Demo data included for immediate testing
- All fields are required for data completeness
- Toast notifications ready for user feedback
- Timestamps auto-generated on create/update
- ID auto-incremented from existing records
- Table uses truncation to prevent layout issues
- External links open safely with `rel="noopener noreferrer"`
- Form uses scrollable dialog for mobile responsiveness

## File Structure

```
src/
├── app/
│   └── dashboard/
│       └── work-requests/
│           └── page.tsx                    # Main work requests page
├── components/
│   └── work-requests/
│       ├── work-request-filter-bar.tsx     # Filter component
│       ├── work-request-form.tsx           # Create/Edit form
│       └── work-request-table.tsx          # Table component
└── types/
    └── work-requests.tsx                   # Work request types
```

## Access the Page

Navigate to: `/dashboard/work-requests`

The page integrates seamlessly with your existing dashboard layout and provides a complete system for managing work request styles and instructions.

## Vietnamese Content Support

The page fully supports Vietnamese language content:
- ✅ Category names in Vietnamese
- ✅ Summary notes in Vietnamese
- ✅ Detailed instructions in Vietnamese
- ✅ Color notes in Vietnamese
- ✅ UTF-8 encoding for all text fields
- ✅ No character limit restrictions

## Use Cases

1. **Training New Employees**: Use as reference for work styles
2. **Quality Assurance**: Ensure work meets style requirements
3. **Client Communication**: Share sample links and specifications
4. **Workflow Documentation**: Maintain consistent work procedures
5. **Style Library**: Build collection of approved work styles
