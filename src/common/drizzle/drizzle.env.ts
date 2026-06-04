import { registerAs } from '@nestjs/config';

export default registerAs('drizzle', () => ({
  databaseUrl: process.env.DATABASE_URL,
  migrationsFolder: process.env.DRIZZLE_MIGRATIONS_DIR,
}));
