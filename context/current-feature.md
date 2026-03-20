# Current Feature

## [Forgot Password Functionality]

**Status: In Progress**

### Goals

- [ ] Add "Forgot Password?" link to SignInForm
- [ ] Create `/forgot-password` page with email input form
- [ ] Create `/api/auth/forgot-password` endpoint to generate and email reset token
- [ ] Create `/reset-password` page with password reset form (validates token from query)
- [ ] Create `/api/auth/reset-password` endpoint to update password
- [ ] Create success and error pages for password reset flow
- [ ] Test complete forgot password flow end-to-end

### Notes

- Reuse existing `VerificationToken` model for password reset tokens
- Use same email infrastructure (Resend) as email verification
- Tokens should expire in 24 hours
- Should respect `ENABLE_EMAIL_VERIFICATION` flag (but this is separate, should always work for password reset)
- Password reset should validate that token exists and hasn't expired
- After successful reset, user should be able to sign in with new password

### References

- Prisma schema: `VerificationToken` model with `identifier` (email) and `token` fields
- Email verification flow: `/api/auth/verify-email/route.ts` as reference for token validation
- Registration flow: `/api/auth/register/route.ts` as reference for email sending

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
- **2026-03-20**: Started Forgot Password Functionality - In Progress
