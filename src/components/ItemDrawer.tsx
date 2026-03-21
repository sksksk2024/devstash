"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Pin, Copy, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ItemWithDetails } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ItemDrawer({
  itemId,
  open,
  onOpenChange,
}: ItemDrawerProps) {
  const [item, setItem] = useState<ItemWithDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && itemId) {
      fetchItem(itemId);
    } else {
      setItem(null);
    }
  }, [open, itemId]);

  const fetchItem = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
      toast.error("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    toast.info(`${action} action will be implemented later`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>Item Details</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="space-x-2">
                <div className="h-8 bg-muted rounded inline-block w-20"></div>
                <div className="h-8 bg-muted rounded inline-block w-20"></div>
              </div>
            </div>
          </div>
        ) : item ? (
          <div className="py-4 space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction("favorite")}
                  title="Favorite"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction("pin")}
                  title="Pin"
                >
                  <Pin
                    className={`h-5 w-5 ${
                      item.isPinned ? "fill-primary text-primary" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction("copy")}
                  title="Copy"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleAction("edit")}
                  title="Edit"
                >
                  <Edit className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAction("delete")}
                title="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Item Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${item.itemType.color}20`,
                    color: item.itemType.color,
                  }}
                >
                  {item.itemType.name}
                </span>
                {item.language && (
                  <span className="text-sm text-muted-foreground capitalize">
                    {item.language}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>

              {item.description && (
                <p className="text-muted-foreground mb-4">{item.description}</p>
              )}

              {item.contentType === "TEXT" && item.content && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Content</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                    {item.content}
                  </pre>
                </div>
              )}

              {item.contentType === "URL" && item.url && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">URL</h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.contentType === "FILE" && item.fileUrl && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">File</h3>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {item.fileName || "Download file"}
                  </a>
                  {item.fileSize && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {(item.fileSize / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              )}

              {/* Collections */}
              {item.collections.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Collections</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.collections.map(({ collection }) => (
                      <span
                        key={collection.id}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                      >
                        {collection.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                {item.lastUsedAt && (
                  <p>
                    Last used: {new Date(item.lastUsedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Item not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
