# Current Feature

## Add Pro Badge to Sidebar

**Status: Not Started**

### Goals

- Add a pro badge to the files and images types in the sidebar
- Use ShadCN UI badge component
- Make badge clean and subtle
- Display "PRO" in all uppercase

### Notes

- Need to identify where item types are displayed in the sidebar
- Apply badge to specific item types (files and images)
- Badge should be visually subtle but noticeable
- Consider badge placement next to item type name or icon

### References

- ShadCN Badge component: `src/components/ui/badge.tsx` (may need to install if not present)
- Sidebar component: `src/components/Sidebar.tsx`
- Item types data structure: `src/lib/db/items.ts`
- Project overview: `context/project-overview.md`
- Coding standards: `context/coding-standards.md`

### Tasks

- [ ] Check if Badge component exists in ShadCN UI, install if needed
- [ ] Analyze Sidebar.tsx to identify where item types are rendered
- [ ] Determine which item types should show "PRO" badge (files and images)
- [ ] Design badge styling (clean and subtle)
- [ ] Implement badge display next to item type names
- [ ] Test sidebar rendering with badge
- [ ] Verify TypeScript compilation and no build errors

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
