"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ItemCard from "@/components/ItemCard";
import ItemDrawer from "@/components/ItemDrawer";
import type { ItemWithDetails } from "@/lib/db/items";

interface DashboardClientProps {
  pinnedItems: ItemWithDetails[];
  recentItems: ItemWithDetails[];
  favoriteItems: ItemWithDetails[];
}

export default function DashboardClient({
  pinnedItems,
  recentItems,
  favoriteItems,
}: DashboardClientProps) {
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

  return (
    <>
      <ItemDrawer
        itemId={selectedItemId}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your collections today.
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
