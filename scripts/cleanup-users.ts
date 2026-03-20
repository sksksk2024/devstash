import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function cleanup() {
  console.log("🧹 Starting database cleanup...\n");

  try {
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@devstash.io" },
    });

    if (!demoUser) {
      console.error("❌ Demo user (demo@devstash.io) not found!");
      console.log(
        "   Please ensure the demo user exists before running cleanup.",
      );
      process.exit(1);
    }

    console.log(`✅ Found demo user: ${demoUser.email} (ID: ${demoUser.id})`);
    console.log(`   This user and their data will be preserved.\n`);

    // Get all non-demo users
    const nonDemoUsers = await prisma.user.findMany({
      where: {
        email: {
          not: "demo@devstash.io",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`📊 Found ${nonDemoUsers.length} non-demo users to delete:`);
    nonDemoUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.name || "No name"})`);
    });

    if (nonDemoUsers.length === 0) {
      console.log("\n✅ No users to delete. Database is already clean.");
      return;
    }

    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will permanently delete:");
    console.log("   - All non-demo users");
    console.log("   - All their items, collections, tags, item types");
    console.log("   - All their sessions, accounts, and verification tokens");
    console.log("\nThis action cannot be undone!");

    console.log("\n⏳ Proceeding with deletion...\n");

    // Collect all non-demo user IDs
    const nonDemoUserIds = nonDemoUsers.map((u) => u.id);
    const nonDemoEmails = nonDemoUsers
      .map((u) => u.email)
      .filter((email): email is string => email !== null);

    // ============================================
    // DELETE IN PROPER ORDER (respecting foreign keys)
    // ============================================

    // 1. Delete join tables first (using itemId from items belonging to non-demo users)
    console.log("🗑️  Deleting join tables...");

    // Get all item IDs from non-demo users
    const nonDemoItems = await prisma.item.findMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
      select: {
        id: true,
      },
    });
    const nonDemoItemIds = nonDemoItems.map((item) => item.id);

    if (nonDemoItemIds.length > 0) {
      const deletedTagsOnItems = await prisma.tagsOnItems.deleteMany({
        where: {
          itemId: {
            in: nonDemoItemIds,
          },
        },
      });
      console.log(`   ✓ TagsOnItems: ${deletedTagsOnItems.count} deleted`);

      const deletedItemCollections = await prisma.itemCollection.deleteMany({
        where: {
          itemId: {
            in: nonDemoItemIds,
          },
        },
      });
      console.log(
        `   ✓ ItemCollection: ${deletedItemCollections.count} deleted`,
      );
    } else {
      console.log("   ✓ TagsOnItems: 0 deleted (no items)");
      console.log("   ✓ ItemCollection: 0 deleted (no items)");
    }

    // 2. Delete items
    console.log("\n🗑️  Deleting items...");
    const deletedItems = await prisma.item.deleteMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ Items: ${deletedItems.count} deleted`);

    // 3. Delete collections
    console.log("\n🗑️  Deleting collections...");
    const deletedCollections = await prisma.collection.deleteMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ Collections: ${deletedCollections.count} deleted`);

    // 4. Delete user-created item types (system types have userId = null)
    console.log("\n🗑️  Deleting user-created item types...");
    const deletedItemTypes = await prisma.itemType.deleteMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ ItemTypes: ${deletedItemTypes.count} deleted`);

    // 5. Delete tags (orphaned after items deleted)
    console.log("\n🗑️  Deleting tags...");
    // Find tags that are only associated with deleted items
    const allTags = await prisma.tag.findMany({
      include: {
        items: {
          include: {
            item: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const orphanedTagIds = allTags
      .filter((tag) =>
        tag.items.every(
          (itemRel) =>
            itemRel.item.userId !== demoUser.id &&
            nonDemoUserIds.includes(itemRel.item.userId),
        ),
      )
      .map((tag) => tag.id);

    if (orphanedTagIds.length > 0) {
      const deletedTags = await prisma.tag.deleteMany({
        where: {
          id: {
            in: orphanedTagIds,
          },
        },
      });
      console.log(`   ✓ Tags: ${deletedTags.count} deleted`);
    } else {
      console.log("   ✓ Tags: 0 deleted (no orphaned tags)");
    }

    // 6. Delete sessions
    console.log("\n🗑️  Deleting sessions...");
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ Sessions: ${deletedSessions.count} deleted`);

    // 7. Delete accounts
    console.log("\n🗑️  Deleting accounts...");
    const deletedAccounts = await prisma.account.deleteMany({
      where: {
        userId: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ Accounts: ${deletedAccounts.count} deleted`);

    // 8. Delete verification tokens
    console.log("\n🗑️  Deleting verification tokens...");
    let deletedVerificationTokensCount = 0;
    if (nonDemoEmails.length > 0) {
      const result = await prisma.verificationToken.deleteMany({
        where: {
          identifier: {
            in: nonDemoEmails,
          },
        },
      });
      deletedVerificationTokensCount = result.count;
      console.log(`   ✓ VerificationTokens: ${result.count} deleted`);
    } else {
      console.log("   ✓ VerificationTokens: 0 deleted (no emails)");
    }

    // 9. Finally, delete users
    console.log("\n🗑️  Deleting users...");
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          in: nonDemoUserIds,
        },
      },
    });
    console.log(`   ✓ Users: ${deletedUsers.count} deleted`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ CLEANUP COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   • Preserved: demo@devstash.io (${demoUser.id})`);
    console.log(`   • Deleted users: ${deletedUsers.count}`);
    console.log(`   • Deleted items: ${deletedItems.count}`);
    console.log(`   • Deleted collections: ${deletedCollections.count}`);
    console.log(`   • Deleted item types: ${deletedItemTypes.count}`);
    console.log(`   • Deleted tags: ${orphanedTagIds.length}`);
    console.log(`   • Deleted sessions: ${deletedSessions.count}`);
    console.log(`   • Deleted accounts: ${deletedAccounts.count}`);
    console.log(
      `   • Deleted verification tokens: ${deletedVerificationTokensCount}`,
    );
    console.log(
      "\n✨ Database is now clean with only the demo user remaining.",
    );
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanup();
