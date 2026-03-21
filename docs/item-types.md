# DevStash Item Types

Comprehensive reference for all 7 item types in DevStash.

---

## Overview

DevStash supports 7 system item types, each with a unique icon, color, and purpose. Items can have three content kinds: **TEXT**, **FILE**, or **URL**.

### Summary by Content Kind

| Content Kind | Item Types                     | Storage Method                         |
| ------------ | ------------------------------ | -------------------------------------- |
| **TEXT**     | Snippet, Prompt, Command, Note | Database (`content` field, Text type)  |
| **FILE**     | File, Image                    | Cloudflare R2 (URL stored in database) |
| **URL**      | Link                           | Database (`url` field)                 |

### Shared Properties

All items have these core fields:

| Field         | Type         | Description                         |
| ------------- | ------------ | ----------------------------------- |
| `id`          | String       | Unique identifier (CUID)            |
| `title`       | String       | Item title                          |
| `description` | String?      | Optional description                |
| `userId`      | String       | Owner (foreign key to User)         |
| `itemTypeId`  | String       | Item type (foreign key to ItemType) |
| `isFavorite`  | Boolean      | Pinned to favorites                 |
| `isPinned`    | Boolean      | Pinned to top of lists              |
| `lastUsedAt`  | DateTime?    | Last accessed timestamp             |
| `createdAt`   | DateTime     | Creation timestamp                  |
| `updatedAt`   | DateTime     | Last update timestamp               |
| `tags`        | Tag[]        | Many-to-many relationship           |
| `collections` | Collection[] | Many-to-many relationship           |

---

## Item Types Reference

### 1. Snippet

- **Name:** `snippet`
- **Icon:** `Code`
- **Hex Color:** `#3b82f6` (Blue)
- **Purpose:** Store reusable code snippets with syntax highlighting
- **Content Kind:** TEXT
- **Key Fields:**
  - `content` (String, Text) — The code content
  - `language` (String?) — Programming language (e.g., "typescript", "python", "yaml")

**Example Use:**

- React hooks
- API endpoints
- Utility functions
- Configuration files

**Route:** `/items/snippets`

---

### 2. Prompt

- **Name:** `prompt`
- **Icon:** `Sparkles`
- **Hex Color:** `#8b5cf6` (Purple)
- **Purpose:** Store AI prompts for code generation, review, or documentation
- **Content Kind:** TEXT
- **Key Fields:**
  - `content` (String, Text) — The prompt text, often with placeholders like `{{code}}`

**Example Use:**

- Code review prompts
- Documentation generators
- Refactoring assistants
- Test case generators

**Route:** `/items/prompts`

---

### 3. Command

- **Name:** `command`
- **Icon:** `Terminal`
- **Hex Color:** `#f97316` (Orange)
- **Purpose:** Store CLI commands, shell scripts, and terminal operations
- **Content Kind:** TEXT
- **Key Fields:**
  - `content` (String, Text) — The command(s) to execute
  - `language` (String?) — Often "bash" or "zsh"

**Example Use:**

- Git operations
- Docker commands
- Deployment scripts
- System administration

**Route:** `/items/commands`

---

### 4. Note

- **Name:** `note`
- **Icon:** `StickyNote`
- **Hex Color:** `#fde047` (Yellow)
- **Purpose:** General text notes, checklists, and documentation
- **Content Kind:** TEXT
- **Key Fields:**
  - `content` (String, Text) — Note content (markdown supported)

**Example Use:**

- Project setup checklists
- Meeting notes
- Architecture decisions
- How-to guides

**Route:** `/items/notes`

---

### 5. File

- **Name:** `file`
- **Icon:** `File`
- **Hex Color:** `#6b7280` (Gray)
- **Purpose:** Upload and store arbitrary files (Pro feature)
- **Content Kind:** FILE
- **Key Fields:**
  - `fileUrl` (String) — Cloudflare R2 URL
  - `fileName` (String?) — Original filename
  - `fileSize` (Int?) — Size in bytes

**Example Use:**

- PDFs
- Configuration files
- Data files (CSV, JSON)
- Archives

**Route:** `/items/files` (Pro only)

---

### 6. Image

- **Name:** `image`
- **Icon:** `Image`
- **Hex Color:** `#ec4899` (Pink)
- **Purpose:** Upload and store images (Pro feature)
- **Content Kind:** FILE
- **Key Fields:**
  - `fileUrl` (String) — Cloudflare R2 URL
  - `fileName` (String?) — Original filename
  - `fileSize` (Int?) — Size in bytes

**Example Use:**

- Diagrams
- Screenshots
- UI mockups
- Reference images

**Route:** `/items/images` (Pro only)

---

### 7. Link

- **Name:** `link`
- **Icon:** `Link`
- **Hex Color:** `#10b981` (Emerald)
- **Purpose:** Store URLs and web references
- **Content Kind:** URL
- **Key Fields:**
  - `url` (String) — The web URL

**Example Use:**

- Documentation links
- API references
- Tutorials
- Resource collections

**Route:** `/items/links`

---

## System Types

All 7 item types are **system types**, meaning they are:

- Seeded automatically on first database setup
- Cannot be edited or deleted by users
- Have `isSystem: true` in the `ItemType` model
- Available to all users by default

### Seeding

System types are created in `prisma/seed.ts`:

```typescript
const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];
```

---

## Display Differences

### Color Coding

Each item type has a distinct border color used throughout the UI:

- **Snippet:** Blue (`#3b82f6`)
- **Prompt:** Purple (`#8b5cf6`)
- **Command:** Orange (`#f97316`)
- **Note:** Yellow (`#fde047`)
- **File:** Gray (`#6b7280`)
- **Image:** Pink (`#ec4899`)
- **Link:** Emerald (`#10b981`)

### Icons

Icons are from the [Lucide](https://lucide.dev/) icon set and are displayed:

- In the sidebar navigation
- On item cards
- In drawer headers
- In collection type hints

### Content Rendering

- **TEXT types** (snippet, prompt, command, note): Rendered in a markdown/code editor with syntax highlighting for code
- **FILE types** (file, image): Show file size, download button, and preview (images show thumbnail)
- **URL type** (link): Shows favicon (if available), domain, and "Open" button

---

## Content Type Enum

The `Item` model uses a `ContentType` enum to distinguish storage strategies:

```prisma
enum ContentType {
  TEXT
  FILE
  URL
}
```

| Enum Value | Used By Types                  | Required Fields                   |
| ---------- | ------------------------------ | --------------------------------- |
| `TEXT`     | snippet, prompt, command, note | `content`                         |
| `FILE`     | file, image                    | `fileUrl`, `fileName`, `fileSize` |
| `URL`      | link                           | `url`                             |

---

## Pro Feature Gating

File and Image types are **Pro-only features**. The UI should:

1. Show locked state for these types in the sidebar for free users
2. Display an upgrade prompt when attempting to create a file/image
3. Gate the routes `/items/files` and `/items/images` behind `isPro` check

---

## Custom Types (Future)

The `ItemType` model supports user-created custom types:

```prisma
model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)
  userId   String? // null for system types
}
```

- `isSystem: false` + `userId: [user-id]` = custom type
- Custom types can be created, edited, or deleted by the user
- Future feature: allow users to define their own item types with custom icons and colors

---

## Last Updated

March 2026
