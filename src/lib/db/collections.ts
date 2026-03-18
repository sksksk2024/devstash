import { prisma } from "@/lib/prisma";

export interface CollectionWithStats {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  dominantTypeColor: string;
  contentTypes: string[]; // array of item type names present in collection
}

export interface ItemTypeStats {
  id: string;
  name: string;
  count: number;
}

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

/**
 * Fetch recent collections with item counts and content type distribution
 */
export async function getRecentCollections(
  limit: number = 6,
): Promise<CollectionWithStats[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  // Fetch collections with their items via ItemCollection join table
  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
            },
          },
        },
      },
    },
  });

  // Transform to include stats
  return collections.map((collection) => {
    // Get actual items from the join table
    const actualItems = collection.items.map((ic) => ic.item);
    const itemCount = actualItems.length;

    // Count occurrences of each item type
    const typeCounts: Record<string, number> = {};
    const contentTypeSet: Set<string> = new Set();

    actualItems.forEach((item) => {
      if (item.itemType) {
        const typeName = item.itemType.name;
        typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
        contentTypeSet.add(typeName);
      }
    });

    // Find the dominant type (most frequent)
    let dominantTypeColor = "#6b7280"; // default gray
    let maxCount = 0;
    let dominantTypeName = "";

    for (const [typeName, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantTypeName = typeName;
      }
    }

    // If we have a dominant type, get its color from the database
    if (dominantTypeName) {
      // Find the item with the dominant type
      const dominantItem = actualItems.find(
        (item) => item.itemType?.name === dominantTypeName,
      );
      if (dominantItem?.itemType?.color) {
        dominantTypeColor = dominantItem.itemType.color;
      }
    }

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      itemCount,
      dominantTypeColor,
      contentTypes: Array.from(contentTypeSet),
    };
  });
}

/**
 * Get item type statistics (count of items per type)
 */
export async function getItemTypeStats(): Promise<ItemTypeStats[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const stats = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: {
      userId,
    },
    _count: {
      itemTypeId: true,
    },
  });

  // Fetch item types to get names (system types)
  const itemTypes = await prisma.itemType.findMany({
    where: {
      userId: null,
      isSystem: true,
    },
  });

  const typeMap = new Map(itemTypes.map((t) => [t.id, t.name]));

  return stats
    .map((stat) => ({
      id: stat.itemTypeId,
      name: typeMap.get(stat.itemTypeId) || "unknown",
      count: stat._count.itemTypeId,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get total item count for a user
 */
export async function getTotalItemCount(): Promise<number> {
  const userId = await getUserId();

  if (!userId) {
    return 0;
  }

  const count = await prisma.item.count({
    where: {
      userId,
    },
  });
  return count;
}

/**
 * Get favorite item count for a user
 */
export async function getFavoriteItemCount(): Promise<number> {
  const userId = await getUserId();

  if (!userId) {
    return 0;
  }

  const count = await prisma.item.count({
    where: {
      userId,
      isFavorite: true,
    },
  });
  return count;
}

/**
 * Get total collection count for a user
 */
export async function getTotalCollectionCount(): Promise<number> {
  const userId = await getUserId();

  if (!userId) {
    return 0;
  }

  const count = await prisma.collection.count({
    where: {
      userId,
    },
  });
  return count;
}

/**
 * Get favorite collection count for a user
 */
export async function getFavoriteCollectionCount(): Promise<number> {
  const userId = await getUserId();

  if (!userId) {
    return 0;
  }

  const count = await prisma.collection.count({
    where: {
      userId,
      isFavorite: true,
    },
  });
  return count;
}
