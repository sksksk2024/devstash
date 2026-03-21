"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { ItemWithDetails } from "@/lib/db/items";

// Validation schema for item update
const updateItemSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  url: z.string().url("Invalid URL format").optional().nullable(),
  language: z.string().optional().nullable(),
  tags: z.array(z.string().min(1).trim()).optional().default([]),
});

type UpdateItemInput = z.infer<typeof updateItemSchema>;

export async function updateItem(
  itemId: string,
  data: UpdateItemInput,
): Promise<{
  success: boolean;
  data: ItemWithDetails | null;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    // Validate input
    const validatedData = updateItemSchema.parse(data);

    // Get session
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        data: null,
        error: "Unauthorized",
      };
    }

    // Verify ownership
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
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
    });

    if (!existingItem) {
      return {
        success: false,
        data: null,
        error: "Item not found",
      };
    }

    // Prepare update data
    const updateData: any = {
      title: validatedData.title,
      description: validatedData.description,
      contentType: existingItem.contentType,
      language: validatedData.language,
      updatedAt: new Date(),
    };

    // Add content fields based on contentType
    if (existingItem.contentType === "TEXT") {
      updateData.content = validatedData.content;
    } else if (existingItem.contentType === "URL") {
      updateData.url = validatedData.url;
    }
    // FILE type doesn't have editable fields in this version

    // Update the item
    await prisma.item.update({
      where: { id: itemId },
      data: updateData,
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
    });

    // Handle tags: disconnect all existing, then connect new ones
    if (validatedData.tags) {
      // Remove all existing tag associations
      await prisma.tagsOnItems.deleteMany({
        where: { itemId: itemId },
      });

      // Create or find tags and connect them
      for (const tagName of validatedData.tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        // Find or create tag
        const tag = await prisma.tag.upsert({
          where: { name: trimmedName },
          update: {},
          create: {
            name: trimmedName,
          },
        });

        // Connect tag to item
        await prisma.tagsOnItems.create({
          data: {
            itemId,
            tagId: tag.id,
          },
        });
      }
    }

    // Return the updated item with fresh data
    const result = await prisma.item.findUnique({
      where: { id: itemId },
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

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error updating item:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        success: false,
        data: null,
        errors,
      };
    }

    return {
      success: false,
      data: null,
      error: "Failed to update item",
    };
  }
}

/**
 * Delete an item by ID
 */
export async function deleteItem(itemId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get session
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Verify ownership and existence
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return {
        success: false,
        error: "Item not found",
      };
    }

    // Delete the item (cascade will handle tagsOnItems)
    await prisma.item.delete({
      where: { id: itemId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      success: false,
      error: "Failed to delete item",
    };
  }
}
