# Current Feature

## [Auth UI - Sign In, Register & Sign Out]

**Status: Not Started**

### Goals

- Create custom Sign In page (`/sign-in`) with email/password form and GitHub OAuth button
- Create custom Register page (`/register`) with name, email, password, confirm password fields and validation
- Update Sidebar user area to display real session data (avatar, name, email)
- Implement avatar dropdown with sign out option
- Add sign out functionality
- Test all authentication flows

### Notes

#### Avatar Logic

- If user has `image` (from GitHub): use that
- Otherwise: generate initials from name (e.g., "Brad Traversy" → "BT")

#### Initials Component

Create a reusable avatar component that handles both cases using existing shadcn/ui Avatar component.

### References

- `context/features/auth-phase-3-spec.md`
- `src/auth.ts` (NextAuth configuration)
- `src/app/api/auth/register/route.ts` (registration endpoint)
- `src/components/Sidebar.tsx` (sidebar user area)

### Tasks

1. Create `/sign-in` page with form validation and error display
2. Create `/register` page with client-side validation (passwords match, email format)
3. Update Sidebar to use `useSession()` hook for real user data
4. Add dropdown menu for avatar with sign out option
5. Implement sign out using NextAuth `signOut()` function
6. Test all flows end-to-end

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
