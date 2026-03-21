import { getRecentCollections, getItemTypeStats } from "@/lib/db/collections";
import {
  getFavoriteItems,
  getPinnedItems,
  getRecentItems,
} from "@/lib/db/items";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch real data from database
  const [
    collectionsData,
    itemTypeStats,
    pinnedItems,
    recentItems,
    favoriteItemsList,
  ] = await Promise.all([
    getRecentCollections(6),
    getItemTypeStats(),
    getPinnedItems(5, userId),
    getRecentItems(10, userId),
    getFavoriteItems(5, userId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search..."
              className="w-64 px-3 py-2 border rounded-md text-sm"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              New Item
            </button>
            <button className="px-4 py-2 border rounded-md text-sm font-medium">
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
          <DashboardClient
            pinnedItems={pinnedItems}
            recentItems={recentItems}
            favoriteItems={favoriteItemsList}
            collections={collectionsData}
          />
        </main>
      </div>
    </div>
  );
}
