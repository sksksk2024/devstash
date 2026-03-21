# Item CRUD Architecture

Unified system for managing all 7 item types in DevStash.

---

## Architecture Principles

1. **Single Source of Truth**: One set of server actions handles mutations for all item types
2. **Type-Adaptive Components**: UI components render differently based on item type, not separate pages
3. **Dynamic Routing**: Single route `/items/[type]` handles all type-specific listing pages
4. **Separation of Concerns**:
   - `lib/db/items.ts` — Data fetching queries (called from server components)
   - `app/actions/items.ts` — Mutations (create, update, delete, pin, favorite)
   - `app/items/[type]/page.tsx` — Server component listing page
   - `components/items/` — Reusable UI components that adapt by type

---

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── items.ts          # All mutation server actions
│   ├── items/
│   │   └── [type]/
│   │       └── page.tsx      # Dynamic route for all types
│   └── api/
│       └── items/
│           └── route.ts      # REST API (optional, for client-side)
├── lib/
│   └── db/
│       └── items.ts          # All data fetching queries
└── components/
    └── items/
        ├── ItemCard.tsx      # Single item card (type-adaptive)
        ├── ItemDrawer.tsx    # Drawer for create/edit/view
        ├── ItemForm.tsx      # Form that adapts by type
        ├── ItemList.tsx      # Grid/list of items
        └── TypeIcon.tsx      # Icon component by type
```

---

## Data Layer (`src/lib/db/items.ts`)

All data fetching happens here via Prisma queries. These functions are called directly from server components.

### Existing Functions (to keep/expand)

```typescript
export async function getFavoriteItems(
  limit?: number,
): Promise<ItemWithDetails[]>;
export async function getPinnedItems(
  limit?: number,
): Promise<ItemWithDetails[]>;
export async function getRecentItems(
  limit?: number,
): Promise<ItemWithDetails[]>;
```

### New Functions to Add

```typescript
/**
 * Get items for a specific user, optionally filtered by type
 */
export async function getItemsByType(
  userId: string,
  typeName: string,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    collectionId?: string;
    sortBy?: "createdAt" | "updatedAt" | "title";
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<ItemWithDetails[]>;

/**
 * Get single item by ID with full details
 */
export async function getItemById(
  itemId: string,
  userId: string,
): Promise<ItemWithDetails | null>;

/**
 * Get count of items by type for a user
 */
export async function getItemCountByType(
  userId: string,
): Promise<Record<string, number>>;

/**
 * Get items by collection
 */
export async function getItemsByCollection(
  collectionId: string,
  userId: string,
): Promise<ItemWithDetails[]>;

/**
 * Search items across all types or filtered by type
 */
export async function searchItems(
  userId: string,
  query: string,
  typeName?: string,
): Promise<ItemWithDetails[]>;
```

### Type Safety

All functions return `ItemWithDetails[]` which includes:

```typescript
export interface ItemWithDetails {
  id: string;
  title: string;
  description: string | null;
  contentType: "TEXT" | "FILE" | "URL";
  content?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  url?: string | null;
  language?: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
    isSystem: boolean;
  };
  collections: {
    collection: {
      id: string;
      name: string;
    };
  }[];
}
```

---

## Mutations (`src/app/actions/items.ts`)

All mutations are server actions (Next.js 15) that accept parameters and return results/errors.

### Function Signatures

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/db/items"; // helper

/**
 * Create a new item
 */
export async function createItem(data: {
  title: string;
  description?: string;
  typeName: string; // "snippet", "prompt", etc.
  contentType: "TEXT" | "FILE" | "URL";
  // TEXT fields
  content?: string;
  language?: string;
  // FILE fields
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  // URL fields
  url?: string;
  // Collections
  collectionIds?: string[];
}): Promise<{ success: boolean; error?: string; item?: ItemWithDetails }>;

/**
 * Update an existing item
 */
export async function updateItem(
  itemId: string,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    language: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    url: string;
    collectionIds: string[];
  }>,
): Promise<{ success: boolean; error?: string; item?: ItemWithDetails }>;

/**
 * Delete an item
 */
export async function deleteItem(
  itemId: string,
): Promise<{ success: boolean; error?: string }>;

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  itemId: string,
): Promise<{ success: boolean; error?: string; isFavorite: boolean }>;

/**
 * Toggle pinned status
 */
export async function togglePin(
  itemId: string,
): Promise<{ success: boolean; error?: string; isPinned: boolean }>;

/**
 * Update last used timestamp
 */
export async function markAsUsed(itemId: string): Promise<void>;
```

### Implementation Notes

- All actions verify `userId` matches the item's `userId` (authorization)
- Use `revalidatePath()` to refresh caches after mutations
- Return structured responses with `success`, `error`, and optional `item` fields
- Type-specific validation happens here (e.g., TEXT items require `content`, URL items require `url`)

---

## Dynamic Route (`src/app/items/[type]/page.tsx`)

Single server component that handles all 7 item type listing pages.

### Route Parameters

- `type` (dynamic segment): The item type name (e.g., "snippets", "prompts", "commands")

### Implementation

```typescript
import { notFound } from "next/navigation";
import { getItemsByType, getItemCountByType, getItemTypeByName } from "@/lib/db/items";
import { ItemList } from "@/components/items/ItemList";
import { ItemToolbar } from "@/components/items/ItemToolbar";
import type { ItemType } from "@prisma/client";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{
    search?: string;
    collection?: string;
    page?: string;
  }>;
}

export default async function ItemsPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { search, collection, page = "1" } = await searchParams;

  // Validate type exists (map URL segment to item type name)
  const typeName = type.toLowerCase(); // "snippets" → "snippet"
  const itemType = await getItemTypeByName(typeName);

  if (!itemType) {
    notFound();
  }

  const userId = await getUserId();
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch items with filters
  const items = await getItemsByType(userId, typeName, {
    search: search,
    collectionId: collection,
    limit: 20,
    offset: (parseInt(page) - 1) * 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  // Fetch counts for UI
  const typeCounts = await getItemCountByType(userId);

  return (
    <div className="container mx-auto py-6">
      {/* Page header with type info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold capitalize">{type} ({typeCounts[typeName] || 0})</h1>
        <p className="text-muted-foreground">
          Manage your {itemType.name} items
        </p>
      </div>

      {/* Toolbar with search, filters, create button */}
      <ItemToolbar
        itemType={itemType}
        initialSearch={search}
        selectedCollection={collection}
      />

      {/* Item grid */}
      <ItemList
        items={items}
        itemType={itemType}
      />
    </div>
  );
}
```

### Type Name Mapping

URL segments use plural forms (for better URLs), but `ItemType.name` is singular:

| URL Segment | Item Type Name |
| ----------- | -------------- |
| `/snippets` | `snippet`      |
| `/prompts`  | `prompt`       |
| `/commands` | `command`      |
| `/notes`    | `note`         |
| `/files`    | `file`         |
| `/images`   | `image`        |
| `/links`    | `link`         |

Mapping logic: `typeName = type.toLowerCase().replace(/s$/, "")` (simple singularization)

---

## Components (`src/components/items/`)

### `TypeIcon.tsx`

Displays the correct Lucide icon for an item type.

```typescript
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";

const iconMap = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

interface TypeIconProps {
  name: string;
  className?: string;
  color?: string;
}

export function TypeIcon({ name, className, color }: TypeIconProps) {
  const Icon = iconMap[name as keyof typeof iconMap] || File;
  return <Icon className={className} color={color} />;
}
```

### `ItemCard.tsx`

Displays a single item in a grid/list. Adapts rendering based on `contentType`.

```typescript
interface ItemCardProps {
  item: ItemWithDetails;
  onEdit: (item: ItemWithDetails) => void;
  onDelete: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
  onTogglePin: (itemId: string) => void;
}

export function ItemCard({ item, onEdit, onDelete, onToggleFavorite, onTogglePin }: ItemCardProps) {
  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      style={{ borderLeftColor: item.itemType.color, borderLeftWidth: "4px" }}
    >
      {/* Header: icon, title, actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <TypeIcon name={item.itemType.name} color={item.itemType.color} />
          <h3 className="font-semibold truncate">{item.title}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite(item.id)}>
              {item.isFavorite ? "Unfavorite" : "Favorite"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePin(item.id)}>
              {item.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content preview based on type */}
      <div className="text-sm text-muted-foreground mb-3">
        {item.contentType === "TEXT" && (
          <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-2 rounded">
            {item.content?.slice(0, 200)}
            {item.content && item.content.length > 200 ? "..." : ""}
          </pre>
        )}
        {item.contentType === "FILE" && (
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span>{item.fileName}</span>
            <span className="text-xs">({formatBytes(item.fileSize)})</span>
          </div>
        )}
        {item.contentType === "URL" && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <LinkIcon className="h-4 w-4" />
            <span className="truncate">{item.url}</span>
          </a>
        )}
      </div>

      {/* Footer: description, tags, collections */}
      {item.description && (
        <p className="text-sm mb-2 line-clamp-2">{item.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {item.collections.map(({ collection }) => (
          <Badge key={collection.id} variant="secondary" className="text-xs">
            {collection.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

### `ItemForm.tsx`

Form for creating/editing items. Adapts fields based on `contentType` and `itemType`.

```typescript
interface ItemFormProps {
  itemType: ItemType;
  initialData?: Partial<ItemWithDetails>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
}

export function ItemForm({ itemType, initialData, onSubmit, onCancel }: ItemFormProps) {
  const [contentType, setContentType] = useState<ContentType>(
    initialData?.contentType || (itemType.name === "link" ? "URL" : "TEXT")
  );

  // File/image types default to FILE content
  useEffect(() => {
    if (itemType.name === "file" || itemType.name === "image") {
      setContentType("FILE");
    }
  }, [itemType.name]);

  return (
    <form onSubmit={handleSubmit}>
      {/* Common fields */}
      <Input name="title" label="Title" required />
      <Textarea name="description" label="Description" />

      {/* Content type selector (for types that support multiple) */}
      {(itemType.name === "snippet" || itemType.name === "prompt" || itemType.name === "command" || itemType.name === "note") && (
        <Select
          name="contentType"
          value={contentType}
          onValueChange={(v) => setContentType(v as ContentType)}
        >
          <option value="TEXT">Text</option>
          <option value="URL">URL</option>
        </Select>
      )}

      {/* TEXT content */}
      {contentType === "TEXT" && (
        <>
          {itemType.name === "snippet" && (
            <Input name="language" label="Language" placeholder="e.g., typescript" />
          )}
          <Textarea
            name="content"
            label="Content"
            rows={10}
            required
          />
        </>
      )}

      {/* URL content */}
      {contentType === "URL" && (
        <Input name="url" label="URL" type="url" required />
      )}

      {/* FILE content */}
      {contentType === "FILE" && (
        <FileUpload
          onUpload={(url, fileName, fileSize) => {
            // Set hidden fields
          }}
          accept={itemType.name === "image" ? "image/*" : "*/*"}
        />
      )}

      {/* Collections multi-select */}
      <CollectionMultiSelect />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
```

### `ItemDrawer.tsx`

Slide-over drawer for create/edit/view operations.

```typescript
interface ItemDrawerProps {
  itemType?: ItemType;
  item?: ItemWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ItemFormData) => Promise<void>;
}

export function ItemDrawer({ itemType, item, open, onOpenChange, onSave }: ItemDrawerProps) {
  const isEditing = !!item;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetTitle>
          {isEditing ? "Edit Item" : `New ${itemType?.name || "Item"}`}
        </SheetTitle>

        {itemType ? (
          <ItemForm
            itemType={itemType}
            initialData={item}
            onSubmit={async (data) => {
              await onSave(data);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <p>Select an item type from the sidebar to create a new item.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

### `ItemList.tsx`

Grid display of items with optional list view toggle.

```typescript
interface ItemListProps {
  items: ItemWithDetails[];
  itemType?: ItemType; // for "create new" context
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export function ItemList({ items, itemType, viewMode = "grid", onViewModeChange }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items found.</p>
        {itemType && (
          <Button className="mt-4" onClick={() => {/* open drawer */}}>
            Create {itemType.name}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} items</p>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange?.("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => onViewModeChange?.("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={cn(
        "grid gap-4",
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

---

## API Route (Optional)

If client-side components need direct access (e.g., for instant updates without server component revalidation), provide a REST API at `/api/items`.

### `src/app/api/items/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import * as db from "@/lib/db/items";
import * as actions from "@/app/actions/items";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const collection = searchParams.get("collection");

  const items = await db.getItemsByType(userId, type!, {
    search,
    collectionId: collection,
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await actions.createItem({ ...body, userId: session.user.id });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.item, { status: 201 });
}
```

---

## Type-Specific Logic Location

**All type-specific logic lives in components, not in actions or db layer.**

### Why?

- **Actions** (`app/actions/items.ts`) are type-agnostic. They validate required fields based on `contentType` but don't contain rendering logic.
- **DB layer** (`lib/db/items.ts`) is type-agnostic. It queries the `Item` table with joins; the `itemType` relation provides type metadata.
- **Components** (`components/items/`) adapt rendering based on:
  - `itemType.name` — for icon, color, routing
  - `contentType` — for form fields and card previews
  - `itemType.name === "file" || "image"` — for file upload UI

### Examples of Type-Specific Behavior

| Behavior                                                                                  | Where Implemented                             |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Card shows code preview for snippets, file info for files, link for links                 | `ItemCard.tsx`                                |
| Form shows language field for snippets, file upload for files/images, URL field for links | `ItemForm.tsx`                                |
| Sidebar shows PRO badge for file/image types                                              | `Sidebar.tsx` (already exists)                |
| Route `/items/snippets` shows all snippets                                                | `app/items/[type]/page.tsx` (filters by type) |
| Syntax highlighting for code                                                              | `ItemCard.tsx` (uses Shiki/Prism)             |

---

## Component Responsibilities

### Server Components

- **`app/items/[type]/page.tsx`**:
  - Fetches data from `lib/db/items.ts`
  - Passes data to client components
  - Handles routing and validation of `type` param
  - No interactivity (except navigation)

### Client Components

- **`ItemList`**:
  - Receives items as props
  - Manages view mode (grid/list)
  - Renders grid of `ItemCard` components
  - May include infinite scroll/pagination

- **`ItemCard`**:
  - Displays single item
  - Shows actions menu (edit, delete, favorite, pin)
  - Adapts preview based on `contentType`
  - Emits events to parent

- **`ItemForm`**:
  - Create/Edit form
  - Adapts fields based on `itemType` and `contentType`
  - Handles file uploads for FILE types
  - Validates required fields
  - Calls server action on submit

- **`ItemDrawer`**:
  - Manages open/close state
  - Contains `ItemForm` or item preview (view mode)
  - Handles routing to `/items/[type]` on close (optional)

- **`ItemToolbar`**:
  - Search input
  - Collection filter dropdown
  - "New Item" button (opens drawer with type context)
  - View mode toggle

- **`TypeIcon`**:
  - Pure presentational component
  - Maps `itemType.name` to Lucide icon
  - Accepts `color` prop

---

## Summary

This architecture provides:

- **Unified mutations**: One action file for all 7 types
- **Type-safe queries**: `lib/db/items.ts` provides all read operations
- **Dynamic routing**: Single page component handles all types via `[type]` param
- **Adaptive UI**: Components switch rendering based on `itemType` and `contentType`
- **Separation**: Type-specific logic isolated to components, keeping data layer clean
- **Scalability**: Adding new item types only requires:
  1. Seed the `ItemType` in `prisma/seed.ts`
  2. Add icon to `TypeIcon.tsx` (if new)
  3. No changes to actions or db layer (they're type-agnostic)
