import { notFound } from "next/navigation";
import { getItemsByType, type ItemWithDetails } from "@/lib/db/items";
import { getRecentCollections, getItemTypeStats } from "@/lib/db/collections";
import Sidebar from "@/components/Sidebar";
import ItemsByTypeClient from "@/components/ItemsByTypeClient";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border rounded-md text-sm font-medium">
              Archive
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              New Collection
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar collections={collectionsData} itemTypeStats={itemTypeStats} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <ItemsByTypeClient
            items={items as ItemWithDetails[]}
            typeName={type}
          />
        </main>
      </div>
    </div>
  );
}
