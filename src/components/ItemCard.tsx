"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Pin } from "lucide-react";
import Link from "next/link";
import type { ItemWithDetails } from "@/lib/db/items";

interface ItemCardProps {
  item: ItemWithDetails;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow border-l-4 h-full"
      style={{
        borderLeftColor: item.itemType.color,
      }}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
            <div className="flex items-center gap-1">
              {item.isPinned && (
                <Pin className="h-3 w-3 text-primary fill-primary" />
              )}
              {item.isFavorite && (
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${item.itemType.color}20`,
                color: item.itemType.color,
              }}
            >
              {item.itemType.name}
            </span>
            {item.language && (
              <span className="capitalize">{item.language}</span>
            )}
            <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mt-3 w-full justify-start"
        >
          <Link href={`/items/${item.id}`}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
