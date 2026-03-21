# Testing Setup

This project uses **Vitest** for unit testing server actions and utilities.

## Configuration

- **Config file**: `vitest.config.ts`
- **Setup file**: `src/__tests__/setup.ts`
- **Test environment**: Node.js
- **Coverage provider**: V8

## Test Scripts

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test File Structure

Tests are located in `src/__tests__/` mirroring the source structure:

```
src/
  __tests__/
    setup.ts          # Global test setup
    lib/
      utils.test.ts   # Utility function tests
      db/
        items.test.ts      # Database item queries
        collections.test.ts # Database collection queries
```

## What to Test

**DO test:**

- Server actions (API routes, form actions)
- Utility functions (helpers, validators, formatters)
- Database query functions (lib/db/)
- Business logic

**DO NOT test:**

- React components (use client-side testing tools like React Testing Library for those)
- UI rendering

## Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });
});
```

### Mocking Prisma

When testing database functions, mock the Prisma client:

```typescript
import { vi } from "vitest";
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    item: { findMany: vi.fn() },
  },
}));
```

### Setup File

The `src/__tests__/setup.ts` file:

- Imports `@testing-library/jest-dom/vitest` for extended matchers
- Stubs environment variables needed for tests
- Runs before all tests

## Coverage

Coverage reports are generated in:

- `coverage/` directory (HTML, JSON, text)
- Excludes: components, app routes, test files themselves

Run `npm run test:coverage` to generate reports.

## Workflow Integration

According to `context/ai-interaction.md`:

1. Implement feature
2. **Test (Browser)** - Verify in browser
3. **Test (Unit)** - Write unit tests for server actions/utilities
4. Build and verify tests pass before committing
