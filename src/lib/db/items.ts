import { prisma } from "@/lib/prisma";

// Helper function to get the demo user ID
async function getUserId(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: {
      email: "demo@devstash.io",
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("Demo user not found. Please run the seed script.");
  }

  return user.id;
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
