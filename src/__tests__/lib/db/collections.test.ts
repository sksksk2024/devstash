import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRecentCollections,
  getItemTypeStats,
  getTotalItemCount,
  getFavoriteItemCount,
  getTotalCollectionCount,
  getFavoriteCollectionCount,
} from "@/lib/db/collections";

// Mock the prisma module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    itemType: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("Database utilities - collections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecentCollections", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getRecentCollections(6);

      expect(result).toEqual([]);
    });

    it("should return empty array when no collections exist", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (
        prisma.collection.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      const result = await getRecentCollections(6);

      expect(result).toEqual([]);
    });

    it("should fetch collections with stats using optimized queries", async () => {
      const mockUserId = "user-123";
      const mockCollections = [
        {
          id: "col-1",
          name: "My Collection",
          description: null,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { items: 5 },
        },
      ];
      const mockItems = [
        {
          id: "item-1",
          itemType: {
            id: "type-1",
            name: "Snippet",
            color: "#ff0000",
          },
          collections: [{ collectionId: "col-1" }],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (
        prisma.collection.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCollections);
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getRecentCollections(6);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("My Collection");
      expect(result[0].itemCount).toBe(5);
      expect(result[0].contentTypes).toContain("Snippet");
      expect(prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          take: 6,
        }),
      );
    });

    it("should calculate dominant type color correctly", async () => {
      const mockUserId = "user-123";
      const mockCollections = [
        {
          id: "col-1",
          name: "Test",
          description: null,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { items: 3 },
        },
      ];
      const mockItems = [
        {
          id: "item-1",
          itemType: { id: "t1", name: "TypeA", color: "#ff0000" },
          collections: [{ collectionId: "col-1" }],
        },
        {
          id: "item-2",
          itemType: { id: "t2", name: "TypeB", color: "#00ff00" },
          collections: [{ collectionId: "col-1" }],
        },
        {
          id: "item-3",
          itemType: { id: "t1", name: "TypeA", color: "#ff0000" },
          collections: [{ collectionId: "col-1" }],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (
        prisma.collection.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCollections);
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getRecentCollections(6);

      expect(result[0].dominantTypeColor).toBe("#ff0000");
    });
  });

  describe("getItemTypeStats", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getItemTypeStats();

      expect(result).toEqual([]);
    });

    it("should return item type statistics", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
        { itemTypeId: "type-1", _count: { itemTypeId: 10 } },
        { itemTypeId: "type-2", _count: { itemTypeId: 5 } },
      ]);
      (prisma.itemType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "type-1", name: "Snippet" },
        { id: "type-2", name: "Link" },
      ]);

      const result = await getItemTypeStats();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Snippet");
      expect(result[0].count).toBe(10);
      expect(result[1].name).toBe("Link");
      expect(result[1].count).toBe(5);
    });

    it("should sort by count descending", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
        { itemTypeId: "type-1", _count: { itemTypeId: 5 } },
        { itemTypeId: "type-2", _count: { itemTypeId: 10 } },
      ]);
      (prisma.itemType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: "type-1", name: "Snippet" },
        { id: "type-2", name: "Link" },
      ]);

      const result = await getItemTypeStats();

      expect(result[0].count).toBe(10);
      expect(result[1].count).toBe(5);
    });
  });

  describe("getTotalItemCount", () => {
    it("should return 0 when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getTotalItemCount();

      expect(result).toBe(0);
    });

    it("should return total item count", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.count as ReturnType<typeof vi.fn>).mockResolvedValue(42);

      const result = await getTotalItemCount();

      expect(result).toBe(42);
      expect(prisma.item.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe("getFavoriteItemCount", () => {
    it("should return 0 when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getFavoriteItemCount();

      expect(result).toBe(0);
    });

    it("should return favorite item count", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.count as ReturnType<typeof vi.fn>).mockResolvedValue(15);

      const result = await getFavoriteItemCount();

      expect(result).toBe(15);
      expect(prisma.item.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, isFavorite: true },
      });
    });
  });

  describe("getTotalCollectionCount", () => {
    it("should return 0 when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getTotalCollectionCount();

      expect(result).toBe(0);
    });

    it("should return total collection count", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.collection.count as ReturnType<typeof vi.fn>).mockResolvedValue(
        7,
      );

      const result = await getTotalCollectionCount();

      expect(result).toBe(7);
    });
  });

  describe("getFavoriteCollectionCount", () => {
    it("should return 0 when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getFavoriteCollectionCount();

      expect(result).toBe(0);
    });

    it("should return favorite collection count", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.collection.count as ReturnType<typeof vi.fn>).mockResolvedValue(
        3,
      );

      const result = await getFavoriteCollectionCount();

      expect(result).toBe(3);
      expect(prisma.collection.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, isFavorite: true },
      });
    });
  });
});
