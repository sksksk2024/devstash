# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all developer knowledge & resources.**

---

## Table of Contents

1. [Problem & Vision](#problem--vision)
2. [Target Users](#target-users)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Data Models & Prisma Schema](#data-models--prisma-schema)
6. [Item Types Reference](#item-types-reference)
7. [Features](#features)
8. [Monetization](#monetization)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [URL Structure](#url-structure)
11. [Key Dependencies & Links](#key-dependencies--links)

---

## Problem & Vision

Developers scatter their essential knowledge across too many places:

| What | Where it lives |
|---|---|
| Code snippets | VS Code, Notion |
| AI prompts | Chat history |
| Context files | Buried in projects |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Commands | `.txt` files, bash history |
| Templates | GitHub Gists |

This creates constant context switching, lost knowledge, and inconsistent workflows. **DevStash** consolidates everything into one fast, keyboard-friendly, AI-enhanced hub.

---

## Target Users

| User | Core Need |
|---|---|
| **Everyday Developer** | Fast grab for snippets, prompts, commands, links |
| **AI-First Developer** | Store prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Organize code blocks, explanations, course notes |
| **Full-Stack Builder** | Collect patterns, boilerplates, API examples |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) / [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Neon](https://neon.tech/) (Serverless PostgreSQL) |
| **ORM** | [Prisma 7](https://www.prisma.io/docs) |
| **Auth** | [NextAuth v5](https://authjs.dev/) — Email/Password + GitHub OAuth |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| **AI** | [OpenAI](https://platform.openai.com/) — `gpt-4o-mini` model |
| **CSS** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **Payments** | [Stripe](https://stripe.com/docs) |
| **Caching** | Redis *(optional, future)* |

> ⚠️ **Migration Rule:** Never use `db push` or manually alter the database schema. All schema changes must go through **Prisma migrations** (`prisma migrate dev` → `prisma migrate deploy`).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│                                                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │   App Router  │    │       API Routes          │   │
│  │  (SSR Pages) │    │  /api/items               │   │
│  │              │    │  /api/collections         │   │
│  │  /dashboard  │    │  /api/ai                  │   │
│  │  /items/[type]│    │  /api/uploads             │   │
│  │  /collections │    │  /api/auth                │   │
│  └──────────────┘    └──────────────────────────┘   │
└─────────────────┬───────────────────┬───────────────┘
                  │                   │
       ┌──────────▼──────┐   ┌────────▼────────┐
       │  Neon Postgres   │   │  Cloudflare R2  │
       │  (via Prisma)    │   │  (file uploads) │
       └──────────────────┘   └─────────────────┘
                  │
       ┌──────────▼──────────┐
       │    OpenAI API        │
       │  (AI Pro features)   │
       └─────────────────────┘
```

**Rendering strategy:**
- SSR for dashboard, collections, item list pages
- Dynamic components (drawers, search, modals) as client components
- API routes for all mutations (create/update/delete items, file uploads, AI calls)

---

## Data Models & Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth (extends NextAuth) ──────────────────────────────

model User {
  id                    String       @id @default(cuid())
  name                  String?
  email                 String?      @unique
  emailVerified         DateTime?
  image                 String?
  password              String?      // hashed, null for OAuth users
  isPro                 Boolean      @default(false)
  stripeCustomerId      String?      @unique
  stripeSubscriptionId  String?      @unique
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  accounts     Account[]
  sessions     Session[]
  items        Item[]
  collections  Collection[]
  itemTypes    ItemType[]   // user-created custom types
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Item Types ───────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet", "prompt", "command", etc.
  icon     String  // Lucide icon name e.g. "Code", "Sparkles"
  color    String  // hex e.g. "#3b82f6"
  isSystem Boolean @default(false) // system types cannot be modified
  userId   String? // null for system types

  user  User?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  items Item[]

  @@unique([name, userId]) // unique per user; system types unique globally
}

// ─── Items ────────────────────────────────────────────────

model Item {
  id          String      @id @default(cuid())
  title       String
  description String?
  contentType ContentType // TEXT | FILE | URL

  // TEXT content
  content     String?     @db.Text

  // FILE content
  fileUrl     String?     // Cloudflare R2 URL
  fileName    String?
  fileSize    Int?        // bytes

  // URL content
  url         String?

  // Code metadata
  language    String?     // e.g. "typescript", "python"

  // State
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  lastUsedAt  DateTime?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId      String
  itemTypeId  String

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType    ItemType         @relation(fields: [itemTypeId], references: [id])
  tags        TagsOnItems[]
  collections ItemCollection[]
}

enum ContentType {
  TEXT
  FILE
  URL
}

// ─── Collections ─────────────────────────────────────────

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // hint for new items added to this collection
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  items  ItemCollection[]
}

// ─── Join Table: Items ↔ Collections ─────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

// ─── Tags ─────────────────────────────────────────────────

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## Item Types Reference

| Type | Icon | Color | Content Kind | Route |
|---|---|---|---|---|
| **Snippet** | `Code` | `#3b82f6` (Blue) | TEXT | `/items/snippets` |
| **Prompt** | `Sparkles` | `#8b5cf6` (Purple) | TEXT | `/items/prompts` |
| **Command** | `Terminal` | `#f97316` (Orange) | TEXT | `/items/commands` |
| **Note** | `StickyNote` | `#fde047` (Yellow) | TEXT | `/items/notes` |
| **File** | `File` | `#6b7280` (Gray) | FILE | `/items/files` *(Pro)* |
| **Image** | `Image` | `#ec4899` (Pink) | FILE | `/items/images` *(Pro)* |
| **Link** | `Link` | `#10b981` (Emerald) | URL | `/items/links` |

> System types are seeded on first run and cannot be edited or deleted by users.

### Seeding System Types

```typescript
// prisma/seed.ts
const systemTypes = [
  { name: "snippet",  icon: "Code",       color: "#3b82f6", isSystem: true },
  { name: "prompt",   icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { name: "command",  icon: "Terminal",   color: "#f97316", isSystem: true },
  { name: "note",     icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file",     icon: "File",       color: "#6b7280", isSystem: true },
  { name: "image",    icon: "Image",      color: "#ec4899", isSystem: true },
  { name: "link",     icon: "Link",       color: "#10b981", isSystem: true },
];
```

---

## Features

### Core (All Users)

- **Items** — Create, edit, delete, pin, and favorite items of any text/URL type
- **Collections** — Group items; one item can belong to multiple collections
- **Search** — Full-text search across titles, content, tags, and type
- **Drawer UI** — Items open in a slide-over drawer for quick access/editing
- **Markdown editor** — For text-based item types
- **Recently used** — Track `lastUsedAt` and surface recent items
- **Import** — Import code from a file into a snippet
- **Dark mode** — Default; light mode toggle available
- **Favorites & Pins** — Items and collections can be favorited; pinned items sort to top
- **Multi-collection membership** — Add/remove items to/from multiple collections
- **Collection membership view** — See which collections any item belongs to
- **Authentication** — Email/password or GitHub OAuth via NextAuth v5

### Pro Only

- **File & Image uploads** — Stored in Cloudflare R2
- **Export** — Download data as JSON or ZIP
- **Custom item types** *(future)*
- **AI: Auto-tag suggestions** — Suggest relevant tags on item save
- **AI: Summarize** — One-click AI summary of any item
- **AI: Explain This Code** — Explain a code snippet in plain English
- **AI: Prompt Optimizer** — Rewrite and improve saved prompts

> 🚧 **During development:** All Pro features are enabled for every user. Gate with `isPro` flag before launch.

---

## Monetization

```
Free Tier                         Pro — $8/mo or $72/yr
─────────────────────────         ─────────────────────────────────
✓ 50 items                        ✓ Unlimited items
✓ 3 collections                   ✓ Unlimited collections
✓ All system types (no files)     ✓ File & Image uploads
✓ Basic search                    ✓ Export (JSON / ZIP)
✗ File / Image uploads            ✓ Custom types (future)
✗ AI features                     ✓ All AI features
                                  ✓ Priority support
```

Payments are handled via **Stripe**. Store `stripeCustomerId` and `stripeSubscriptionId` on the `User` model and use webhooks to sync `isPro` status.

---

## UI/UX Guidelines

### Design Principles

- Modern, minimal, developer-focused
- Dark mode by default; light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks (e.g. [Shiki](https://shiki.style/) or [highlight.js](https://highlightjs.org/))
- References: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │  Main Content Area                 │
│                         │                                     │
│  ─ Item Types ─         │  Collections Grid                  │
│    • Snippets           │  ┌────────┐ ┌────────┐ ┌────────┐ │
│    • Prompts            │  │React   │ │Python  │ │AI      │ │
│    • Commands           │  │Patterns│ │Snippets│ │Prompts │ │
│    • Notes              │  └────────┘ └────────┘ └────────┘ │
│    • Links              │                                     │
│    • Files (Pro)        │  Items (color-coded by type)       │
│    • Images (Pro)       │  ┌────────┐ ┌────────┐ ┌────────┐ │
│                         │  │useEffect│ │curl cmd│ │GPT sys │ │
│  ─ Collections ─        │  │snippet │ │command │ │prompt  │ │
│    ★ React Patterns     │  └────────┘ └────────┘ └────────┘ │
│    ★ Context Files      │                                     │
│    + New Collection     │                          [+ New]   │
└─────────────────────────────────────────────────────────────┘
```

- **Cards**: Color-coded by type (border color for items, background tint for collections)
- **Drawer**: Items open in a right-side slide-over drawer
- **Mobile**: Sidebar collapses into a hamburger drawer

### Micro-interactions

- Smooth drawer open/close transitions
- Hover states on all cards
- Toast notifications for create/update/delete/copy actions
- Loading skeletons on initial data fetch

---

## URL Structure

| Route | Description |
|---|---|
| `/` | Landing / marketing page |
| `/dashboard` | Main dashboard (collections + recent items) |
| `/items` | All items |
| `/items/snippets` | Filtered by type |
| `/items/prompts` | Filtered by type |
| `/items/commands` | Filtered by type |
| `/items/notes` | Filtered by type |
| `/items/links` | Filtered by type |
| `/items/files` | Filtered by type *(Pro)* |
| `/items/images` | Filtered by type *(Pro)* |
| `/collections` | All collections |
| `/collections/[id]` | Single collection view |
| `/settings` | Account, billing, preferences |
| `/api/items` | CRUD for items |
| `/api/collections` | CRUD for collections |
| `/api/uploads` | File upload to R2 |
| `/api/ai/tag` | AI auto-tag |
| `/api/ai/explain` | AI code explain |
| `/api/ai/summarize` | AI summarize |
| `/api/ai/optimize-prompt` | AI prompt optimizer |

---

## Key Dependencies & Links

### Official Docs

| Package | Link |
|---|---|
| Next.js 15 | https://nextjs.org/docs |
| React 19 | https://react.dev |
| Prisma 7 | https://www.prisma.io/docs |
| NextAuth v5 | https://authjs.dev/getting-started |
| Neon | https://neon.tech/docs |
| Cloudflare R2 | https://developers.cloudflare.com/r2/ |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com/docs |
| Stripe | https://stripe.com/docs |
| OpenAI Node SDK | https://platform.openai.com/docs/libraries |
| Lucide Icons | https://lucide.dev/icons/ |

### Suggested Additional Packages

| Package | Purpose |
|---|---|
| [`@aws-sdk/client-s3`](https://www.npmjs.com/package/@aws-sdk/client-s3) | R2 file uploads (S3-compatible) |
| [`shiki`](https://shiki.style/) | Syntax highlighting |
| [`zod`](https://zod.dev/) | Schema validation for API routes |
| [`nuqs`](https://nuqs.47ng.com/) | Type-safe URL search params |
| [`sonner`](https://sonner.emilkowal.ski/) | Toast notifications |
| [`cmdk`](https://cmdk.paco.me/) | Command palette / quick search |
| [`@tanstack/react-query`](https://tanstack.com/query) | Client-side data fetching & caching |
| [`uploadthing`](https://uploadthing.com/) | Alternative to direct R2 if simpler DX desired |

---

*Last updated: March 2026*
