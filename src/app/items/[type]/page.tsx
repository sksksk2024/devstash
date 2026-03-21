import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { getItemsByType, type ItemWithDetails } from "@/lib/db/items";
import { getRecentCollections, getItemTypeStats } from "@/lib/db/collections";
import Link from "next/link";
import { Archive, FolderOpen } from "lucide-react";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

/**
 * Items by type page - displays all items of a specific type
 * Dynamic route: /items/[type]
 */
export async function generateMetadata({ params }: PageProps) {
  const { type } = await params;
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    title: `${formattedType} - DevStash`,
    description: `Browse your ${formattedType.toLowerCase()} items`,
  };
}

export default async function ItemsByTypePage({ params }: PageProps) {
  const { type } = await params;
  const [collectionsData, itemTypeStats, items] = await Promise.all([
    getRecentCollections(6),
    getItemTypeStats(),
    getItemsByType(type),
  ]);

  // Check if this type exists (system or custom)
  const typeExists = itemTypeStats.some(
    (stat: { name: string }) => stat.name.toLowerCase() === type.toLowerCase(),
  );

  if (!typeExists) {
    notFound();
  }

  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Archive className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button>
              <FolderOpen className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar collections={collectionsData} itemTypeStats={itemTypeStats} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {formattedType}
              </h2>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <Separator />

            {/* Items Grid */}
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item: ItemWithDetails) => (
                  <ItemCard key={item.id} item={item} />
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
                    You haven't created any {formattedType.toLowerCase()} yet.
                    Start by creating your first one!
                  </p>
                  <Button>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Create {formattedType}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
