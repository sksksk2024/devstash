import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function testDatabase() {
  console.log("🔍 Testing database connection...\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    // Test 1: Check connection
    console.log("1. Testing connection...");
    await prisma.$connect();
    console.log("   ✅ Connected to database\n");

    // Test 2: Run a simple query
    console.log("2. Running test query...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("   ✅ Query executed:", result, "\n");

    // Test 3: Check if tables exist
    console.log("3. Checking database tables...");
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`   ✅ Found ${tables.length} tables:`);
    tables.forEach((t) => console.log(`   - ${t.table_name}`));
    console.log();

    // Test 4: Count records in main tables
    console.log("4. Checking table counts...");
    const userCount = await prisma.user.count();
    const itemTypeCount = await prisma.itemType.count();
    const itemCount = await prisma.item.count();
    const collectionCount = await prisma.collection.count();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - ItemTypes: ${itemTypeCount}`);
    console.log(`   - Items: ${itemCount}`);
    console.log(`   - Collections: ${collectionCount}\n`);

    // Test 5: Fetch and display demo user
    console.log("5. Fetching demo user...");
    const demoUser = await prisma.user.findFirst({
      where: { email: "demo@devstash.io" },
      select: {
        id: true,
        email: true,
        name: true,
        isPro: true,
        emailVerified: true,
        _count: {
          select: {
            items: true,
            collections: true,
          },
        },
      },
    });

    if (demoUser) {
      console.log(`   ✓ Demo user found:`);
      console.log(`     - ID: ${demoUser.id}`);
      console.log(`     - Name: ${demoUser.name}`);
      console.log(`     - Email: ${demoUser.email}`);
      console.log(`     - Pro: ${demoUser.isPro}`);
      console.log(`     - Items: ${demoUser._count.items}`);
      console.log(`     - Collections: ${demoUser._count.collections}\n`);
    } else {
      console.log("   ⚠ Demo user not found\n");
    }

    // Test 6: Fetch and display collections
    console.log("6. Fetching collections...");
    const collections = await prisma.collection.findMany({
      where: { userId: demoUser?.id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    collections.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.name}`);
      console.log(`      Description: ${col.description || "None"}`);
      console.log(`      Items: ${col._count.items}`);
      console.log(`      Favorite: ${col.isFavorite}\n`);
    });

    // Test 7: Fetch and display recent items
    console.log("7. Fetching recent items...");
    const recentItems = await prisma.item.findMany({
      where: { userId: demoUser?.id },
      include: {
        itemType: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    recentItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.title}`);
      console.log(`      Type: ${item.itemType.name} (${item.itemType.icon})`);
      console.log(`      ContentType: ${item.contentType}`);
      console.log(`      Favorite: ${item.isFavorite}\n`);
    });

    console.log("✅ All database tests passed!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDatabase();
