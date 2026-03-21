import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch user data with stats
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true, // to check if email/password user
      _count: {
        select: {
          items: true,
          collections: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Get item type breakdown
  const itemTypeStats = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId: user.id },
    _count: {
      itemTypeId: true,
    },
  });

  // Fetch item types to get names (system + custom)
  const itemTypes = await prisma.itemType.findMany({
    where: {
      OR: [{ userId: null, isSystem: true }, { userId: user.id }],
    },
  });

  const typeMap = new Map(itemTypes.map((t) => [t.id, t]));

  const stats = itemTypeStats
    .map((stat) => ({
      type: typeMap.get(stat.itemTypeId),
      count: stat._count.itemTypeId,
    }))
    .filter((s) => s.type)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">DevStash</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Profile Settings
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar spacer */}
        <div className="hidden md:block w-64 border-r" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <ProfileClient user={user} itemTypeStats={stats} />
          </div>
        </main>
      </div>
    </div>
  );
}
