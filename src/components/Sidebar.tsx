"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Settings,
  FolderOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { itemTypes } from "@/lib/mock-data";
import { ItemTypeStats } from "@/lib/db/collections";

interface Collection {
  id: string;
  name: string;
  description?: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor?: string;
}

interface SidebarProps {
  collections?: Collection[];
  itemTypeStats?: ItemTypeStats[];
}

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; color?: string }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export default function Sidebar({
  collections = [],
  itemTypeStats = [],
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  // Deterministic sorting to avoid hydration mismatch (sort by itemCount descending)
  const recentCollections = [...collections]
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 3);

  // Create a map of item type counts for quick lookup
  const typeCountMap = new Map(
    itemTypeStats.map((stat) => [stat.name, stat.count]),
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarContent = () => (
    <>
      <ScrollArea className="flex-1 px-2 py-2">
        {/* Item Types Navigation */}
        <div className="mb-3">
          {!isCollapsed && (
            <h3 className="mb-1 px-2 text-xs font-semibold uppercase text-muted-foreground">
              Navigation
            </h3>
          )}
          <Separator className="mb-3" />
          <nav className="space-y-1">
            {itemTypes.map((type) => {
              const Icon = iconMap[type.icon] || File;
              const isActive = pathname === `/items/${type.name}`;
              const count = typeCountMap.get(type.name) || 0;
              const isProType = type.name === "file" || type.name === "image";

              return (
                <Link
                  key={type.id}
                  href={`/items/${type.name}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    isCollapsed && "justify-center px-2",
                  )}
                  title={isCollapsed ? type.name : undefined}
                >
                  <Icon className="h-4 w-4" color={type.color} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 flex items-center gap-2">
                        {type.name}
                        {isProType && (
                          <Badge
                            variant="subtle"
                            className="h-4 px-1 text-[10px] font-bold"
                          >
                            PRO
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collections Container */}
        {!isCollapsed && (
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-7 px-2"
              onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
            >
              {isCollectionsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FolderOpen className="h-4 w-4" />
              <span className="flex-1 text-left text-sm font-medium">
                Collections
              </span>
              <span className="text-xs text-muted-foreground">
                {collections.length}
              </span>
            </Button>

            {isCollectionsExpanded && (
              <>
                {/* Favorite Collections - indented */}
                <div className="mb-3 pl-6">
                  <div className="mb-1 flex items-center justify-between px-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Favorites
                    </h3>
                    {favoriteCollections.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => setShowAllFavorites(!showAllFavorites)}
                      >
                        {showAllFavorites ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <nav className="space-y-1">
                    {(showAllFavorites
                      ? favoriteCollections
                      : favoriteCollections.slice(0, 3)
                    ).map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors",
                          pathname === `/collections/${collection.id}`
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                        title={collection.name}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        <span className="truncate flex-1">
                          {collection.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {collection.itemCount}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Recent Collections - indented */}
                <div className="mb-3 pl-6">
                  <div className="mb-1 flex items-center justify-between px-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                      Recent
                    </h3>
                    {collections.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => setShowAllRecent(!showAllRecent)}
                      >
                        {showAllRecent ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  <nav className="space-y-1">
                    {(showAllRecent ? collections : recentCollections).map(
                      (collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.id}`}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors",
                            pathname === `/collections/${collection.id}`
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted",
                          )}
                          title={collection.name}
                        >
                          <div
                            className="h-4 w-4 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                collection.dominantTypeColor || "#6b7280",
                            }}
                          />
                          <span className="truncate flex-1">
                            {collection.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {collection.itemCount}
                          </span>
                        </Link>
                      ),
                    )}
                  </nav>
                </div>

                {/* View All Collections Link */}
                <div className="pl-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-7 px-2 text-xs"
                    asChild
                  >
                    <Link href="/collections">
                      <FolderOpen className="h-4 w-4" />
                      <span>View all collections</span>
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Separator before User Area */}
      <Separator />

      {/* User Avatar Area - Bottom with Settings */}
      <div
        className={cn(
          "border-t p-2",
          isCollapsed
            ? "flex flex-col items-center gap-2"
            : "flex items-center gap-2",
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
          <AvatarFallback>DU</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="truncate text-sm font-medium">Demo User</p>
              <p className="truncate text-xs text-muted-foreground">
                demo@devstash.io
              </p>
            </div>
          </>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "relative border-r bg-card transition-all duration-300 hidden md:flex flex-col h-[calc(100vh-60px)]",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Collapse Toggle - Desktop Only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        <SidebarContent />
      </aside>

      {/* Mobile Drawer - Always Visible on Mobile */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-64 flex flex-col"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Mobile Header - aligned with Navigation */}
          <div className="flex items-center justify-between px-2 py-2 border-b">
            <h3 className="px-2 text-xs font-semibold uppercase text-muted-foreground">
              Navigation
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
