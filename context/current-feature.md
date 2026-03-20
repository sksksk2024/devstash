# Current Feature

## [Current Feature]

**Status: Not Started**

### Goals

### Notes

### References

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
