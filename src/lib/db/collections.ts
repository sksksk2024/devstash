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
 * Optimized: Uses 2 queries instead of N+1 (1 per collection)
 */
export async function getRecentCollections(
  limit: number = 6,
): Promise<CollectionWithStats[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  try {
    // Step 1: Fetch collections with item count using _count aggregation
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { items: true },
        },
      },
    });

    if (collections.length === 0) {
      return [];
    }

    const collectionIds = collections.map((c) => c.id);

    // Step 2: Fetch ALL items for these collections in a single query
    // This replaces N separate queries (one per collection) with 1 query
    const allItems = await prisma.item.findMany({
      where: {
        userId,
        collections: {
          some: {
            collectionId: { in: collectionIds },
          },
        },
      },
      include: {
        itemType: true,
        collections: {
          select: { collectionId: true },
        },
      },
    });

    // Build a map of collectionId -> items and type distribution
    const collectionItemsMap = new Map<string, typeof allItems>();
    const collectionTypeCountsMap = new Map<string, Record<string, number>>();
    const collectionContentTypesMap = new Map<string, Set<string>>();

    // Initialize maps for each collection
    for (const collectionId of collectionIds) {
      collectionItemsMap.set(collectionId, []);
      collectionTypeCountsMap.set(collectionId, {});
      collectionContentTypesMap.set(collectionId, new Set());
    }

    // Distribute items into their collections and aggregate types
    for (const item of allItems) {
      // An item can belong to multiple collections, so we need to check each
      for (const collRef of item.collections) {
        const collectionId = collRef.collectionId;
        if (collectionIds.includes(collectionId)) {
          const collectionItems = collectionItemsMap.get(collectionId)!;
          collectionItems.push(item);

          const typeCounts = collectionTypeCountsMap.get(collectionId)!;
          const contentTypes = collectionContentTypesMap.get(collectionId)!;

          if (item.itemType) {
            const typeName = item.itemType.name;
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
            contentTypes.add(typeName);
          }
        }
      }
    }

    // Step 3: Build the result
    return collections.map((collection) => {
      const itemCount = collection._count.items;
      const typeCounts = collectionTypeCountsMap.get(collection.id) || {};
      const contentTypes =
        collectionContentTypesMap.get(collection.id) || new Set();

      // Find dominant type (most frequent)
      let dominantTypeColor = "#6b7280";
      let maxCount = 0;

      for (const [typeName, count] of Object.entries(typeCounts)) {
        if (count > maxCount) {
          maxCount = count;
          // Find the color from any item with this type
          const collectionItems = collectionItemsMap.get(collection.id) || [];
          const itemWithType = collectionItems.find(
            (i) => i.itemType?.name === typeName,
          );
          if (itemWithType?.itemType?.color) {
            dominantTypeColor = itemWithType.itemType.color;
          }
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
        contentTypes: Array.from(contentTypes),
      };
    });
  } catch (error) {
    console.error("Failed to fetch recent collections:", error);
    throw error;
  }
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
