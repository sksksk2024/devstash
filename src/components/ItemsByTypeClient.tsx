"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ItemCard from "@/components/ItemCard";
import ItemDrawer from "@/components/ItemDrawer";
import type { ItemWithDetails } from "@/lib/db/items";

interface ItemsByTypeClientProps {
  items: ItemWithDetails[];
  typeName: string;
}

export default function ItemsByTypeClient({
  items,
  typeName,
}: ItemsByTypeClientProps) {
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

  const formattedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);

  return (
    <>
      <ItemDrawer
        itemId={selectedItemId}
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{formattedType}</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <Separator />

        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: ItemWithDetails) => (
              <ItemCard key={item.id} item={item} onClick={handleItemClick} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-muted-foreground">
                No {formattedType} Yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You haven&apos;t created any {formattedType.toLowerCase()} yet.
                Start by creating your first one!
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
                Create {formattedType}
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
