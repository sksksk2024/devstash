"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ItemCard from "@/components/ItemCard";
import ItemDrawer from "@/components/ItemDrawer";
import type { ItemWithDetails } from "@/lib/db/items";
import type { CollectionWithStats } from "@/lib/db/collections";

interface DashboardClientProps {
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
  favoriteItems: ItemWithDetails[];
  collections: CollectionWithStats[];
}

export default function DashboardClient({
  pinnedItems: initialPinnedItems,
  recentItems: initialRecentItems,
  favoriteItems: initialFavoriteItems,
  collections,
}: DashboardClientProps) {
  const [pinnedItems, setPinnedItems] = useState(initialPinnedItems);
  const [recentItems, setRecentItems] = useState(initialRecentItems);
  const [favoriteItems, setFavoriteItems] = useState(initialFavoriteItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    setIsDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setSelectedItemId(null);
    }
  };

  const handleDelete = useCallback((itemId: string) => {
    // Remove item from all state arrays
    setPinnedItems((prev) => prev.filter((item) => item.id !== itemId));
    setRecentItems((prev) => prev.filter((item) => item.id !== itemId));
    setFavoriteItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  return (
    <>
      <ItemDrawer
        itemId={selectedItemId}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onDelete={handleDelete}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your collections today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {pinnedItems.length + recentItems.length + favoriteItems.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{favoriteItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Favorite items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{pinnedItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pinned items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{recentItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Recent items</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Latest Collections */}
        {collections.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Latest Collections
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="h-full border-l-4"
                  style={{ borderLeftColor: collection.dominantTypeColor }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium line-clamp-1">
                        {collection.name}
                      </h4>
                      {collection.isFavorite && (
                        <span className="text-yellow-500">★</span>
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                      <span className="font-medium">
                        {collection.itemCount} items
                      </span>
                      {collection.contentTypes.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {collection.contentTypes.slice(0, 2).map((type) => (
                              <span
                                key={type}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: `${collection.dominantTypeColor}20`,
                                  color: collection.dominantTypeColor,
                                }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* Pinned Items */}
        {pinnedItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Pinned Items
              </h3>
            </div>
            <div className="space-y-3">
              {pinnedItems.map((item) => (
                <ItemCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </section>
        )}

        {/* Favorite Items */}
        {favoriteItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Favorite Items
              </h3>
            </div>
            <div className="space-y-3">
              {favoriteItems.map((item) => (
                <ItemCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Recent Items
              </h3>
            </div>
            <div className="space-y-3">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
