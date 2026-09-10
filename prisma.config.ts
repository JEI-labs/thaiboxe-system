import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 moved the datasource connection string out of `schema.prisma`.
 * The CLI (migrate, db push, studio, seed) reads it from here; the runtime
 * client gets it via the driver adapter in `src/server/db.ts`.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
