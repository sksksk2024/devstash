import { prisma } from "@/lib/prisma";

// Helper function to get the demo user ID
// Returns null if demo user doesn't exist (e.g., in production before seeding)
async function getUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      email: "demo@devstash.io",
    },
    select: {
      id: true,
    },
  });

  return user?.id ?? null;
}

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

/**
 * Get favorite items for the user
 */
export async function getFavoriteItems(
  limit: number = 5,
): Promise<ItemWithDetails[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId,
      isFavorite: true,
    },
    include: {
      itemType: true,
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  return items as ItemWithDetails[];
}

/**
 * Get pinned items for the user
 */
export async function getPinnedItems(
  limit: number = 5,
): Promise<ItemWithDetails[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId,
      isPinned: true,
    },
    include: {
      itemType: true,
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  return items as ItemWithDetails[];
}

/**
 * Get recently used items (by lastUsedAt or updatedAt)
 */
export async function getRecentItems(
  limit: number = 10,
): Promise<ItemWithDetails[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId,
    },
    include: {
      itemType: true,
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        lastUsedAt: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    take: limit,
  });

  return items as ItemWithDetails[];
}

/**
 * Get items filtered by type name for a specific user
 */
export async function getItemsByType(
  typeName: string,
  limit?: number,
): Promise<ItemWithDetails[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  // First, find the item type by name for this user (or system type)
  const itemType = await prisma.itemType.findFirst({
    where: {
      name: typeName,
      OR: [
        { userId: null, isSystem: true }, // system type
        { userId }, // user's custom type
      ],
    },
  });

  if (!itemType) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId,
      itemTypeId: itemType.id,
    },
    include: {
      itemType: true,
      collections: {
        include: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],
    ...(limit && { take: limit }),
  });

  return items as ItemWithDetails[];
}
