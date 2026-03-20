# Current Feature

## [Auth Phase 2: Email/Password Credentials]

**Status: Completed**

### Goals

- [x] Add Credentials provider placeholder in `auth.config.ts`
- [x] Override Credentials provider in `auth.ts` with bcrypt validation logic
- [x] Create registration API route at `/api/auth/register` with password hashing
- [x] Test registration and sign-in flow
- [x] Verify GitHub OAuth still works

### Notes

- User model already has password field in Prisma schema
- bcryptjs is already installed
- Using split auth pattern: config in `auth.config.ts`, overrides in `auth.ts`
- Credentials provider added directly in `auth.ts` (not in `auth.config.ts`) to avoid duplication
- Registration endpoint tested successfully with user creation
- Sign-in with credentials works via `/api/auth/signin/credentials`
- GitHub OAuth continues to work

### References

- Credentials provider: https://authjs.dev/getting-started/authentication/credentials
- NextAuth v5 split config pattern

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
