# Rate Limiting for Auth

## Status: In Progress

### Goals

- [ ] ADD rate limiting to auth-related API routes using Upstash Redis
- [ ] Create reusable `src/lib/rate-limit.ts` utility with sliding window algorithm
- [ ] Protect `/api/auth/register` (3 attempts per hour, by IP)
- [ ] Protect `/api/auth/forgot-password` (3 attempts per hour, by IP)
- [ ] Protect `/api/auth/reset-password` (5 attempts per 15 min, by IP)
- [ ] Protect `/api/auth/resend-verification` (3 attempts per 15 min, by IP + email)
- [ ] Handle NextAuth credentials login rate limiting (5 attempts per 15 min, by IP + email)
- [ ] Return proper 429 responses with `Retry-After` header
- [ ] Display user-friendly error messages on frontend
- [ ] Ensure rate limiting fails open if Upstash unavailable

### Notes

- Using `@upstash/ratelimit` with sliding window algorithm
- IP extraction from `x-forwarded-for` or `x-real-ip` headers
- Environment variables: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Upstash free tier: 10k requests/day (sufficient)
- Login rate limiting may require custom NextAuth sign-in handler

### References

- Spec: `context/features/rate-limiting-spec.md`
- Upstash Ratelimit: https://upstash.com/docs/ratelimit
- NextAuth credentials provider: `src/auth.ts`

### Tasks

- [ ] Create `src/lib/rate-limit.ts` utility
- [ ] Implement IP extraction helper
- [ ] Create rate limit middleware/handler
- [ ] Protect each endpoint with appropriate limits
- [ ] Test all endpoints
- [ ] Verify error responses and frontend messages

**History**
**History**

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
