import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed system item types
  const systemTypes = [
    { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
    { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
    { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
    { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
    { name: "file", icon: "File", color: "#6b7280", isSystem: true },
    { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
    { name: "link", icon: "Link", color: "#10b981", isSystem: true },
  ];

  for (const type of systemTypes) {
    await prisma.itemType.upsert({
      where: { name: type.name },
      update: type,
      create: type,
    });
  }

  console.log("✅ Seeded system item types");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
