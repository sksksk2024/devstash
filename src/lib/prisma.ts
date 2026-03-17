import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 Client Configuration
 *
 * In Prisma 7, the PrismaClient requires either an adapter or accelerateUrl.
 * For direct PostgreSQL connections, we use @prisma/adapter-pg.
 *
 * The DATABASE_URL is read from environment variables.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
