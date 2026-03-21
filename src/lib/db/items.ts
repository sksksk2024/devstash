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
  tags: {
    tag: {
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
  userId?: string,
): Promise<ItemWithDetails[]> {
  const resolvedUserId = userId ?? (await getUserId());

  if (!resolvedUserId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId: resolvedUserId,
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
      tags: {
        include: {
          tag: {
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
  userId?: string,
): Promise<ItemWithDetails[]> {
  const resolvedUserId = userId ?? (await getUserId());

  if (!resolvedUserId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId: resolvedUserId,
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
      tags: {
        include: {
          tag: {
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
  userId?: string,
): Promise<ItemWithDetails[]> {
  const resolvedUserId = userId ?? (await getUserId());

  if (!resolvedUserId) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId: resolvedUserId,
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
      tags: {
        include: {
          tag: {
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
  userId?: string,
): Promise<ItemWithDetails[]> {
  const resolvedUserId = userId ?? (await getUserId());

  if (!resolvedUserId) {
    return [];
  }

  // First, find the item type by name for this user (or system type)
  const itemType = await prisma.itemType.findFirst({
    where: {
      name: typeName,
      OR: [
        { userId: null, isSystem: true }, // system type
        { userId: resolvedUserId }, // user's custom type
      ],
    },
  });

  if (!itemType) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: {
      userId: resolvedUserId,
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
      tags: {
        include: {
          tag: {
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

/**
 * Get a single item by ID with full details
 */
export async function getItemById(
  id: string,
  userId: string,
): Promise<ItemWithDetails | null> {
  const item = await prisma.item.findFirst({
    where: {
      id,
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
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return item as ItemWithDetails | null;
}
