# Database Setup Guide - Neon PostgreSQL + Prisma 7

## Quick Start

### 1. Create a Neon PostgreSQL Database

1. Go to [Neon.tech](https://neon.tech) and sign up/log in
2. Create a new project:
   - Click "New Project"
   - Choose a name (e.g., "devstash")
   - Select a region close to you
   - Click "Create Project"
3. Get your connection string:
   - In your project dashboard, click "Connect"
   - Select "Prisma" as the driver
   - Copy the connection string (looks like: `postgresql://username:password@your-neon-host.neon.tech:5432/your-database?sslmode=require`)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   - Paste the Neon connection string as `DATABASE_URL`
   - Generate a secure `NEXTAUTH_SECRET`:
     ```bash
     # On Windows PowerShell:
     openssl rand -base64 32
     # Or use any 32+ character random string
     ```
   - Set `NEXTAUTH_URL` to `http://localhost:3000` for development

### 3. Run Initial Migration

```bash
npm run prisma:migrate
```

This will:

- Create the database tables based on `prisma/schema.prisma`
- Generate a migration file in `prisma/migrations/`
- Apply the migration to your Neon database

### 4. Seed System Data

```bash
npm run prisma:seed
```

This will create the 7 system item types:

- snippet (Code, blue)
- prompt (Sparkles, purple)
- command (Terminal, orange)
- note (StickyNote, yellow)
- file (File, gray)
- image (Image, pink)
- link (Link, emerald)

### 5. Verify Setup

```bash
npm run prisma:status
```

You should see:

- ✅ Datasource connected
- ✅ Migration history synced
- ✅ No pending migrations

### 6. Open Prisma Studio (Optional)

```bash
npm run prisma:studio
```

This opens a visual database editor at `http://localhost:5555` where you can view and edit your data.

## Prisma 7 Important Notes

### Breaking Changes from Prisma 6

1. **Datasource URL Configuration**:
   - ❌ **OLD**: `url = env("DATABASE_URL")` in `schema.prisma`
   - ✅ **NEW**: Configure in `prisma.config.ts` and pass to `PrismaClient` constructor

2. **Client Generation**:
   - Client is generated to `node_modules/@prisma/client` by default
   - No need for `output` directive in generator block

3. **Migrations**:
   - Always use `prisma migrate dev` (not `db push`)
   - Production: `prisma migrate deploy`

### Project Structure

```
prisma/
├── schema.prisma          # Main schema file
├── seed.ts                # Database seeding script
├── migrations/            # Auto-generated migrations
└── prisma.config.ts      # Prisma 7 configuration

src/
└── lib/
    └── prisma.ts          # Prisma client singleton
```

### Using Prisma Client in Your Code

```typescript
import { prisma } from "@/lib/prisma";

// Example queries
const items = await prisma.item.findMany({
  where: { userId: "user-id" },
  include: {
    itemType: true,
    collections: {
      include: { collection: true },
    },
  },
});
```

## Troubleshooting

### "Can't reach database server"

- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active (not paused)
- Ensure your IP is allowed (Neon can restrict by IP)

### "Module '@prisma/client' has no exported member 'PrismaClient'"

- Run `npm run prisma:generate` to regenerate the client
- Restart your TypeScript language server
- Ensure `@prisma/client` is in dependencies (not devDependencies)

### Migration fails with "already exists"

- Check existing migrations: `npm run prisma:status`
- Reset database (WARNING: deletes all data):
  ```bash
  npx prisma migrate reset
  ```

## Next Steps After Setup

1. Integrate Prisma with NextAuth v5
2. Create API routes for CRUD operations
3. Implement server actions for mutations
4. Add error handling and validation
5. Set up R2 for file uploads (Pro feature)

## References

- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma Postgres Quickstart](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres)
- [Neon Documentation](https://neon.tech/docs)
- [Project Overview](../context/project-overview.md)
- [Database Spec](../context/features/database-spec.md)
