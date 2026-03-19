# Current Feature

## Optimize N+1 Queries

**Status: Not Started**

### Goals

- Optimize `getRecentCollections()` to use database-level aggregation
- Replace client-side item counting with Prisma's `_count` aggregation
- For dominant type color, use database-level grouping to find most frequent item type
- Maintain backward compatibility with existing dashboard UI
- Add proper error handling

### Notes

The current implementation in `src/lib/db/collections.ts` loads all collection items and their item types into memory, then manually calculates item counts and dominant type colors. This creates an N+1 query pattern that can cause performance issues with larger datasets.

**Quick Win:** Use Prisma's `_count` aggregation and groupBy to reduce database queries.

### References

- Current implementation: `src/lib/db/collections.ts:43-88`
- Prisma 7 aggregation docs: https://www.prisma.io/docs/orm/aggregation-grouping-and-batching

### Tasks

- [ ] Analyze current N+1 pattern in `getRecentCollections()`
- [ ] Design optimized query using Prisma groupBy or raw SQL
- [ ] Implement optimized version with database-level aggregation
- [ ] Test with seeded data to ensure results match
- [ ] Verify TypeScript types are correct
- [ ] Run build to ensure no errors

**History**

- **2026-03-16**: Initial Next.js 15 + Tailwind CSS setup committed
- **2026-03-17**: Created `src/lib/mock-data.ts` with mock data structure
- **2026-03-17**: Completed Dashboard UI Phase 1 - ShadCN initialized, components installed
- **2026-03-17**: Completed Phase 2 - Sidebar with collapsible navigation, collections, user area
- **2026-03-17**: Completed Phase 3 - Main area with stats, collections, pinned/recent items
- **2026-03-17**: Completed Prisma 7 setup with Neon PostgreSQL, generated client, seeded database
- **2026-03-18**: Dashboard Collections Integration - Complete
  - Replaced mock collection data with real database queries
  - Added Favorites, Pinned, and Recent items sections with real data
  - Collection cards use dominant type color for border and icons
- **2026-03-18**: Dashboard Items Integration - Complete
  - Items display with color-coded borders and type tags
  - Stats updated to use real data
  - All sections conditional based on data presence
- **2026-03-18**: Stats & Sidebar Integration - Complete
  - Updated Sidebar Collection interface with `dominantTypeColor`
  - Replaced Clock icon with colored circle based on dominant item type
  - Added "View all collections" link under Collections section
  - Build successful, no TypeScript errors
  - Feature implemented on branch `feature/stats-sidebar-integration`
- **2026-03-19**: Add Pro Badge to Sidebar - Complete
  - Created Badge component (`src/components/ui/badge.tsx`)
  - Added PRO badge to "file" and "image" item types in sidebar navigation
  - Badge uses subtle variant, clean and minimal styling
  - Build successful, no TypeScript errors
  - Feature implemented on branch `feature/add-pro-badge-sidebar`

- **2026-03-19**: Optimize N+1 Queries - Next Feature
  - Identified N+1 pattern in `getRecentCollections()` function
  - Client-side aggregation loads all items into memory
  - Need to move item counting and dominant type calculation to database
  - Target file: `src/lib/db/collections.ts`
