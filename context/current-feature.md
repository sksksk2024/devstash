# Current Feature

## Status: Complete

### Goals

- ✅ Create dynamic route `/items/[type]`
- ✅ Fetch and display items filtered by type
- ✅ Responsive grid of ItemCard components
- ✅ Two columns on medium and up (implemented: 1 col mobile, 2 col md, 3 col lg)
- ✅ Each card has left border colored by item type
- ✅ Follow existing codebase patterns
- ✅ Add `getItemById()` query function
- ✅ Create `/api/items/[id]` endpoint with auth
- ✅ Build ItemDrawer client component using Sheet
- ✅ Update ItemCard to trigger drawer on click
- ✅ Integrate drawer into Dashboard page
- ✅ Integrate drawer into Items/[type] page
- ✅ Test drawer functionality

### Notes

Feature implemented successfully:

- Added `getItemById()` to `src/lib/db/items.ts`
- Created `/api/items/[id]` route with auth check and JSON response
- Created `ItemDrawer.tsx` client component with:
  - Right-side slide-in drawer using shadcn Sheet
  - Skeleton loading state with pulse animation
  - Action bar with Favorite, Pin, Copy, Edit, Delete buttons
  - Full item details display (title, description, content, language, collections, dates)
  - Proper handling of different content types (TEXT, URL, FILE)
- Updated `ItemCard.tsx` to accept `onClick` prop instead of Link
- Created `DashboardClient.tsx` wrapper to manage drawer state on dashboard
- Created `ItemsByTypeClient.tsx` wrapper for items list pages
- Integrated drawer into both Dashboard and Items/[type] pages
- Build passes with no TypeScript errors
- Dev server runs successfully on http://localhost:3000

### References

- Spec: `context/features/item-drawer-spec.md`
- Project Overview: `context/project-overview.md`
- Coding Standards: `context/coding-standards.md`

### Tasks

**History**

- **2026-03-16**: Initial Next.js 15 + Tailwind CSS setup committed
- **2026-03-17**: Created `src/lib/mock-data.ts` with mock data structure
- **2026-03-17**: Completed Dashboard UI Phase 1 - ShadCN initialized, components installed
- **2026-03-17**: Completed Phase 2 - Sidebar with collapsible navigation, collections, user area
- **2026-03-17**: Completed Phase 3 - Main area with stats, collections, pinned/recent items
- **2026-03-17**: Completed Prisma 7 setup with Neon PostgreSQL, generated client, seeded database
- **2026-03-18**: Dashboard Collections Integration - Complete
- **2026-03-18**: Dashboard Items Integration - Complete
- **2026-03-18**: Stats & Sidebar Integration - Complete
- **2026-03-19**: Add Pro Badge to Sidebar - Complete
- **2026-03-19**: Optimize N+1 Queries - Complete
- **2026-03-19**: Auth Setup - NextAuth + GitHub Provider - Complete
- **2026-03-20**: Auth Phase 2 - Email/Password Credentials - Complete
  - Added Credentials provider with bcrypt validation in `auth.ts`
  - Created `/api/auth/register` endpoint with password hashing
  - Tested registration and sign-in successfully
  - GitHub OAuth still functional
- **2026-03-20**: Email Verification Toggle - Complete
  - Added `ENABLE_EMAIL_VERIFICATION` env variable (server-side)
  - Added `NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION` for client-side UI
  - Updated registration to auto-verify when disabled
  - Updated credentials provider to skip verification check when disabled
  - Updated RegisterForm to show conditional messages
  - Merged into master
- **2026-03-20**: Forgot Password Functionality - Complete
  - Added "Forgot Password?" link to SignInForm
  - Created `/forgot-password` page with email input form
  - Created `/api/auth/forgot-password` endpoint to generate and email reset token using VerificationToken model
  - Created `/reset-password` page with password reset form (validates token from query)
  - Created `/api/auth/reset-password` endpoint to update password and delete used tokens
  - Built success/error states into the reset password flow
  - Fixed lint errors and verified build passes
  - Feature merged into master
- **2026-03-21**: Profile Page - Complete
  - Created `/profile` route with protected access (redirects unauthenticated users)
  - Implemented profile information card showing: name, email, avatar (GitHub or initials), account creation date, authentication method
  - Added usage statistics with total items, collections, and item type count
  - Implemented item type breakdown grid with icons and colors
  - Added change password functionality (only visible for email/password users)
  - Created `/api/auth/change-password` endpoint with current password verification
  - Added delete account with confirmation dialog
  - Created `/api/auth/delete-account` endpoint with cascade deletion
  - Added session callback in `auth.ts` to include user id in session
  - Created `alert-dialog` UI component
  - All lint warnings fixed, build successful
- **2026-03-21**: Rate Limiting for Auth - Complete
  - Created `src/lib/rate-limit.ts` utility with Upstash Redis sliding window
  - Protected `/api/auth/register` (3 attempts/hour, by IP)
  - Protected `/api/auth/forgot-password` (3 attempts/hour, by IP)
  - Protected `/api/auth/reset-password` (5 attempts/15min, by IP)
  - Protected NextAuth credentials login (5 attempts/15min, by IP+email)
  - Returns 429 with `Retry-After` header
  - Fail-open when Upstash unavailable
  - Build passes, lint clean
- **2026-03-21**: Items List View - Complete
  - Added `getItemsByType()` function to `src/lib/db/items.ts`
  - Created `src/components/ItemCard.tsx` with type-based left border and responsive design
  - Built dynamic route `src/app/items/[type]/page.tsx` with grid layout (1→2→3 columns)
  - Type validation with 404 for invalid types
  - Empty state with call-to-action
  - Build successful, no TypeScript errors
- **2026-03-21**: Item Drawer - Complete
  - Branch: `feature/item-drawer`
  - Added `getItemById()` to `src/lib/db/items.ts`
  - Created `/api/items/[id]` route with auth check
  - Created `ItemDrawer.tsx` client component using Sheet (right side)
  - Updated `ItemCard.tsx` to use onClick prop instead of Link
  - Created `DashboardClient.tsx` wrapper for dashboard drawer state
  - Created `ItemsByTypeClient.tsx` wrapper for items list drawer state
  - Integrated drawer into Dashboard and Items/[type] pages
  - Build passes, no TypeScript errors
  - Dev server runs successfully
