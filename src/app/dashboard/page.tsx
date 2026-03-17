import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { collections, items, currentUser } from "@/lib/mock-data";
import { Archive, FolderOpen, Heart, Pin, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // Get pinned items (server-side filtering)
  const pinnedItems = items.filter((item) => item.isPinned);

  // Get recent items (sorted by lastUsedAt, then createdAt)
  const recentItems = [...items]
    .sort((a, b) => {
      const aDate = a.lastUsedAt || a.updatedAt;
      const bDate = b.lastUsedAt || b.updatedAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <Input type="search" placeholder="Search..." className="w-64" />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {currentUser.name.split(" ")[0]}!
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening with your collections today.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Archive className="h-4 w-4 text-blue-500" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{items.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All saved items
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-green-500" />
                    Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{collections.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total collections
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    Favorite Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {items.filter((item) => item.isFavorite).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Starred items
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    Favorite Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {collections.filter((c) => c.isFavorite).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Starred collections
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Latest Collections */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Latest Collections
                </h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/collections">View all</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.slice(0, 6).map((collection) => (
                  <Card
                    key={collection.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${collection.color}20` }}
                        >
                          <FolderOpen
                            className="h-5 w-5"
                            style={{ color: collection.color }}
                          />
                        </div>
                        {collection.isFavorite && (
                          <span className="text-red-500 text-sm">★</span>
                        )}
                      </div>
                      <CardTitle className="text-base mt-2 line-clamp-1">
                        {collection.name}
                      </CardTitle>
                      {collection.description && (
                        <CardDescription className="line-clamp-2">
                          {collection.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{collection.itemCount} items</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          asChild
                        >
                          <Link href={`/collections/${collection.id}`}>
                            Open
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Pinned Items */}
            {pinnedItems.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Pin className="h-5 w-5" />
                    Pinned Items
                  </h3>
                </div>
                <div className="space-y-3">
                  {pinnedItems.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-8 w-1 rounded-full shrink-0"
                            style={{ backgroundColor: item.itemType.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm line-clamp-1">
                                {item.title}
                              </h4>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${item.itemType.color}20`,
                                  color: item.itemType.color,
                                }}
                              >
                                {item.itemType.name}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Updated{" "}
                                {new Date(item.updatedAt).toLocaleDateString()}
                              </span>
                              {item.language && (
                                <span className="capitalize">
                                  {item.language}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="shrink-0"
                          >
                            <Link href={`/items/${item.id}`}>Open</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Items */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Items
                </h3>
              </div>
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "hover:shadow-md transition-shadow",
                      item.isPinned && "border-l-4",
                      item.isPinned && "border-l-primary",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="h-8 w-1 rounded-full shrink-0"
                          style={{ backgroundColor: item.itemType.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {item.title}
                            </h4>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${item.itemType.color}20`,
                                color: item.itemType.color,
                              }}
                            >
                              {item.itemType.name}
                            </span>
                            {item.isPinned && (
                              <Pin className="h-3 w-3 text-primary fill-primary" />
                            )}
                            {item.isFavorite && (
                              <span className="text-red-500 text-sm">★</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Last used{" "}
                              {new Date(
                                item.lastUsedAt || item.updatedAt,
                              ).toLocaleDateString()}
                            </span>
                            {item.language && (
                              <span className="capitalize">
                                {item.language}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <Link href={`/items/${item.id}`}>Open</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
