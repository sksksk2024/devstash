import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getFavoriteItems,
  getPinnedItems,
  getRecentItems,
  getItemsByType,
} from "@/lib/db/items";

// Mock the prisma module
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
    },
    itemType: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("Database utilities - items", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFavoriteItems", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getFavoriteItems(5);

      expect(result).toEqual([]);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "demo@devstash.io" },
        select: { id: true },
      });
    });

    it("should return favorite items for user", async () => {
      const mockUserId = "user-123";
      const mockItems = [
        {
          id: "item-1",
          title: "Favorite Item",
          description: null,
          contentType: "TEXT",
          isFavorite: true,
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          itemType: {
            id: "type-1",
            name: "Snippet",
            icon: "code",
            color: "#ff0000",
            isSystem: true,
          },
          collections: [],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getFavoriteItems(5);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Favorite Item");
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isFavorite: true },
        include: {
          itemType: true,
          collections: {
            include: {
              collection: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });
    });
  });

  describe("getPinnedItems", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getPinnedItems(5);

      expect(result).toEqual([]);
    });

    it("should return pinned items for user", async () => {
      const mockUserId = "user-123";
      const mockItems = [
        {
          id: "item-1",
          title: "Pinned Item",
          isPinned: true,
          itemType: {
            id: "type-1",
            name: "Note",
            icon: "sticky-note",
            color: "#00ff00",
            isSystem: true,
          },
          collections: [],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getPinnedItems(5);

      expect(result).toHaveLength(1);
      expect(result[0].isPinned).toBe(true);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, isPinned: true },
        include: expect.any(Object),
        orderBy: { updatedAt: "desc" },
        take: 5,
      });
    });
  });

  describe("getRecentItems", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getRecentItems(10);

      expect(result).toEqual([]);
    });

    it("should return recent items ordered by lastUsedAt then updatedAt", async () => {
      const mockUserId = "user-123";
      const mockItems = [
        {
          id: "item-1",
          title: "Recent Item",
          lastUsedAt: new Date(),
          itemType: {
            id: "type-1",
            name: "Link",
            icon: "link",
            color: "#0000ff",
            isSystem: true,
          },
          collections: [],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getRecentItems(10);

      expect(result).toHaveLength(1);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: expect.any(Object),
        orderBy: [{ lastUsedAt: "desc" }, { updatedAt: "desc" }],
        take: 10,
      });
    });
  });

  describe("getItemsByType", () => {
    it("should return empty array when user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getItemsByType("snippets");

      expect(result).toEqual([]);
    });

    it("should return empty array when item type not found", async () => {
      const mockUserId = "user-123";
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.itemType.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await getItemsByType("nonexistent");

      expect(result).toEqual([]);
    });

    it("should return items filtered by type", async () => {
      const mockUserId = "user-123";
      const mockItemType = { id: "type-1", name: "Snippets", isSystem: true };
      const mockItems = [
        {
          id: "item-1",
          title: "Snippet Item",
          itemTypeId: "type-1",
          itemType: {
            id: "type-1",
            name: "Snippets",
            icon: "code",
            color: "#ff0000",
            isSystem: true,
          },
          collections: [],
        },
      ];

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.itemType.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItemType,
      );
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItems,
      );

      const result = await getItemsByType("Snippets", 10);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Snippet Item");
      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            itemTypeId: "type-1",
          }),
        }),
      );
    });

    it("should handle limit parameter correctly", async () => {
      const mockUserId = "user-123";
      const mockItemType = { id: "type-1", name: "Snippets", isSystem: true };

      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockUserId,
      });
      (prisma.itemType.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockItemType,
      );
      (prisma.item.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await getItemsByType("Snippets", 5);

      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        }),
      );
    });
  });
});
