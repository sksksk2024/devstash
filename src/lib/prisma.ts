import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 Client Configuration
 *
 * In Prisma 7, the datasource URL is configured in prisma.config.ts
 * and passed to the PrismaClient constructor via the datasourceUrl option.
 *
 * The .env file is loaded by prisma.config.ts using dotenv/config.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
