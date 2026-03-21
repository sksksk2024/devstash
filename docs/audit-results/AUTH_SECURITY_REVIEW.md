# Authentication Security Review

**Audit Date:** March 21, 2026  
**Project:** DevStash  
**NextAuth Version:** v5 (beta.30)  
**Scope:** Authentication-related code security audit

---

## Executive Summary

This audit examined the authentication implementation in DevStash, focusing on areas **not** automatically handled by NextAuth v5. The codebase shows good security practices in many areas, but **critical gaps** were identified, primarily around **rate limiting** and **token race conditions**.

**Overall Risk Level:** HIGH  
**Critical Findings:** 1  
**High Findings:** 2  
**Medium Findings:** 1  
**Low Findings:** 1

---

## Critical Findings

### CRIT-1: No Rate Limiting on Authentication Endpoints

**File:** All auth routes (`src/app/api/auth/*/route.ts`)  
**Severity:** CRITICAL  
**CVSS Score:** 7.5 (High)

**Description:**
None of the authentication endpoints implement rate limiting:

- `/api/auth/register` - User registration
- `/api/auth/forgot-password` - Password reset requests
- `/api/auth/reset-password` - Password reset submission
- `/api/auth/verify-email` - Email verification
- `/api/auth/change-password` - Password change (authenticated)
- Credentials sign-in via `/api/auth/[...nextauth]`

This allows attackers to:

- Perform unlimited brute force attacks on the credentials provider (despite NextAuth's built-in protections, the credentials authorize function can be called repeatedly)
- Enumerate valid email addresses through timing differences in registration and password reset endpoints
- Send unlimited password reset emails to harass users or fill up email quotas
- Exhaust server resources through DoS attacks

**Evidence:**

```typescript
// src/app/api/auth/register/route.ts - No rate limiting
export async function POST(request: NextRequest) {
  try {
    // ... direct processing without any rate check
```

**Recommended Fix:**
Implement rate limiting using a middleware or library like `@upstash/ratelimit` (compatible with Vercel/Edge) or `rate-limiter-flexible`. Example:

```typescript
import { ratelimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(5, "1 hour", "register");
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }
  // ... existing code
}
```

Apply different limits per endpoint:

- Register: 5 attempts per hour per IP
- Forgot password: 3 attempts per hour per IP
- Reset password: 5 attempts per hour per IP + token-based rate limit
- Verify email: 10 attempts per hour per IP (token-based)
- Change password: 10 attempts per hour per user ID
- Sign-in: 5 failed attempts per 15 minutes per IP + 5 per user ID

---

## High Findings

### HIGH-1: Potential Race Condition in Token Operations

**File:** `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/verify-email/route.ts`, `src/app/api/auth/register/route.ts`  
**Severity:** HIGH

**Description:**
The token generation and usage flow has a race condition vulnerability. The pattern used is:

1. Delete existing tokens: `deleteMany({ where: { identifier: email } })`
2. Create new token: `verificationToken.create({ data: { identifier: email, token, expires } })`

If two requests happen simultaneously (e.g., user clicks "forgot password" twice quickly), both may pass the delete step before either creates a token, resulting in **multiple valid tokens** for the same identifier. While the current code deletes all tokens on password reset, the verification flow doesn't have the same protection.

**Evidence:**

```typescript
// src/app/api/auth/forgot-password/route.ts:28-34
await prisma.verificationToken.deleteMany({
  where: { identifier: email },
});
// ... then creates new token without transaction/atomic operation

// src/app/api/auth/register/route.ts:60-66
// Same pattern - delete then create without atomic guarantee
```

**Recommended Fix:**
Use a database transaction with row-level locking or an upsert operation:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.verificationToken.deleteMany({
    where: { identifier: email },
  });
  await tx.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: expiresAt,
    },
  });
});
```

Alternatively, use an upsert with a unique constraint on `(identifier, token)` and delete old ones in a separate step, but the transaction approach is cleaner.

### HIGH-2: Missing Database Constraints on VerificationToken

**File:** `prisma/schema.prisma`  
**Severity:** HIGH

**Description:**
The `VerificationToken` model lacks proper foreign key constraints to the `User` table. The `identifier` field is just a string with no reference to the `User` model. This allows:

- Orphaned tokens for non-existent users
- No automatic cleanup when a user is deleted
- Potential for token injection attacks if an attacker can guess or control an identifier

**Evidence:**

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  // Missing: foreign key to User(id) or at least a reference
}
```

**Recommended Fix:**
Add a nullable `userId` field with a foreign key to `User`:

```prisma
model VerificationToken {
  identifier String
  userId     String?
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Then update all token creation to include the `userId` after looking up the user. This enables cascade deletion and ensures tokens are tied to actual users.

---

## Medium Findings

### MED-1: Insufficient Password Policy

**File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`  
**Severity:** MEDIUM

**Description:**
Password validation only checks minimum length (6 characters) but does not enforce:

- Complexity requirements (uppercase, lowercase, numbers, special characters)
- Maximum length (could allow DoS via extremely long passwords)
- Common password checks (e.g., "password123")
- Password reuse history (users could cycle between 2 passwords)

**Evidence:**

```typescript
// src/app/api/auth/register/route.ts: No password validation beyond length check
// src/app/api/auth/reset-password/route.ts:52
const hashedPassword = await bcrypt.hash(password, 10);
// No validation before hashing

// src/app/api/auth/change-password/route.ts:33
if (newPassword.length < 6) {
  return NextResponse.json(
    { error: "New password must be at least 6 characters" },
    { status: 400 },
  );
}
// Only length check
```

**Recommended Fix:**
Implement a password validation utility:

```typescript
// src/lib/password-validator.ts
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    errors.push("Password is too long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check against common passwords (use a list or library)
  const commonPasswords = ["password", "123456", "qwerty", "admin"];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common");
  }

  return { valid: errors.length === 0, errors };
}
```

Apply this in all three endpoints before hashing.

---

## Low Findings

### LOW-1: bcrypt Rounds Could Be Increased

**File:** `src/auth.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`  
**Severity:** LOW

**Description:**
All password hashing uses `bcrypt.hash(password, 10)` with 10 rounds. While this is acceptable, increasing to 12 rounds provides significantly better security against brute force attacks with modern hardware, with minimal performance impact for typical user bases.

**Evidence:**

```typescript
// All files use bcrypt.hash(..., 10)
const hashedPassword = await bcrypt.hash(password, 10);
```

**Recommended Fix:**
Consider increasing to 12 rounds:

```typescript
const SALT_ROUNDS = process.env.NODE_ENV === "production" ? 12 : 10;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

Monitor performance after the change. If using bcryptjs (as in this project), the performance impact is lower than native bcrypt.

---

## Passed Checks ✓

The following security aspects were verified and are correctly implemented:

### Password Hashing

- ✅ Uses bcrypt (industry standard, adaptive)
- ✅ Proper salt generation (automatic in bcrypt)
- ✅ No plaintext password storage
- ✅ Password comparison uses timing-safe `bcrypt.compare`

### Token Security

- ✅ Uses `crypto.randomBytes(32)` for 256-bit entropy (cryptographically secure)
- ✅ Tokens expire after 24 hours (reasonable timeframe)
- ✅ Single-use enforcement: tokens are deleted after use
- ✅ Email verification flow properly checks expiration and deletes expired tokens
- ✅ Password reset flow deletes all tokens for the user after successful reset

### Email Verification Flow

- ✅ Token sent via email only (not returned in API response)
- ✅ Proper error handling without leaking user existence (generic messages)
- ✅ Token validation before marking email as verified
- ✅ Prevents replay attacks by deleting token after use
- ✅ Handles already-verified case gracefully

### Password Reset Flow

- ✅ Token validation before allowing password change
- ✅ Expiration check enforced
- ✅ Token deleted after use
- ✅ All tokens for the user deleted after reset (prevents reuse of other tokens)
- ✅ Does not reveal if user exists (generic success message)
- ✅ Checks if user has password field (OAuth users can't reset)
- ✅ Email sending failure cleans up token

### Session Validation

- ✅ Protected routes (`/profile`, `/api/auth/change-password`, `/api/auth/delete-account`) properly check `auth()` session
- ✅ Redirects to sign-in when session invalid
- ✅ Uses NextAuth's built-in session management with JWT strategy
- ✅ Session callbacks properly inject user ID into token and session

### Profile Page Security

- ✅ Server-side session validation before rendering
- ✅ User data fetched from database using session user ID (no client-side ID manipulation possible)
- ✅ Password change requires current password verification
- ✅ Delete account requires authentication
- ✅ No sensitive data exposed in client props (password hash not sent to client)
- ✅ Proper authorization checks in change password (compares current password hash)

### Sensitive Data Exposure

- ✅ No passwords in logs or error messages
- ✅ Generic error messages that don't leak user existence
- ✅ Email addresses properly encoded in URLs (`encodeURIComponent`)
- ✅ No console.log of sensitive data in production code (only error logging)
- ✅ Email content includes standard security notice ("If you didn't request...")

### OAuth User Handling

- ✅ Properly distinguishes OAuth vs email/password users
- ✅ Prevents password operations for OAuth-only accounts
- ✅ Credentials provider checks for OAuth users and blocks sign-in
- ✅ Profile page shows correct authentication method

### Database Constraints

- ✅ `User.email` is unique
- ✅ `Account` has unique `[provider, providerAccountId]`
- ✅ `Session.sessionToken` is unique
- ✅ `VerificationToken` has unique `[identifier, token]`
- ✅ Foreign keys with proper cascade delete rules
- ✅ `password` field nullable for OAuth users

### Error Handling

- ✅ Try-catch blocks on all endpoints
- ✅ Appropriate HTTP status codes
- ✅ No stack traces or sensitive details returned to client
- ✅ Server-side errors logged with `console.error` for debugging

---

## Additional Recommendations

### 1. Implement Rate Limiting (See CRIT-1)

This is the highest priority fix.

### 2. Add Token Race Condition Protection (See HIGH-1)

Wrap token operations in transactions.

### 3. Add Foreign Key to VerificationToken (See HIGH-2)

Improves data integrity and cleanup.

### 4. Strengthen Password Policy (See MED-1)

Add complexity requirements.

### 5. Consider Adding Email Confirmation Required Setting

The `ENABLE_EMAIL_VERIFICATION` flag exists but isn't checked in the sign-in flow. The credentials provider in `src/auth.ts` does check it, but ensure consistency:

```typescript
// In src/auth.ts, the check exists:
if (isEmailVerificationEnabled && !existingUser.emailVerified) {
  throw new Error("EMAIL_NOT_VERIFIED");
}
```

This is correct, but consider making the error message user-friendly on the frontend.

### 6. Add Request Logging for Security Monitoring

Consider adding structured logging for auth events (failed logins, registrations, password resets) with IP addresses to detect attacks. Use a service like Sentry or a simple file logger.

### 7. Implement CSRF Token Validation for State-Changing Operations

While NextAuth handles CSRF for its routes, the custom endpoints (`/api/auth/change-password`, `/api/auth/delete-account`) should verify the user's session more robustly. Currently they use `auth()` which is good, but consider adding CSRF tokens for extra protection, especially if any of these endpoints accept GET requests in the future.

### 8. Add Password Breach Check

Integrate with HaveIBeenPwned API or similar to prevent use of compromised passwords.

### 9. Set Up Security Headers

Ensure Next.js security headers are configured:

```typescript
// next.config.ts
const headers = [
  {
    source: "/:path*",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  },
];
```

### 10. Add Account Lockout After Failed Sign-In Attempts

Implement temporary lockout after 5 failed sign-in attempts per user/IP to prevent credential stuffing. This can be done with a counter in the database or a cache like Redis.

---

## Conclusion

The authentication implementation is **generally well-designed** with proper use of NextAuth v5, bcrypt, and secure token generation. The **lack of rate limiting** is the most critical issue and should be addressed immediately. The **token race condition** and **missing foreign key** are also high-priority fixes.

The codebase demonstrates good understanding of security fundamentals in password handling, token management, and error handling. With the recommended fixes, the authentication system will be robust against common attack vectors.

---

## Files Audited

- `src/auth.ts`
- `src/auth.config.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/delete-account/route.ts`
- `src/app/profile/page.tsx`
- `src/app/profile/ProfileClient.tsx`
- `prisma/schema.prisma`
- `package.json`

---

**Auditor:** Auth Security Audit Subagent (automated)  
**Next Steps:** Implement critical and high-priority fixes before production deployment.
