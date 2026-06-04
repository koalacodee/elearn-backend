import { BunSQLDatabase } from 'drizzle-orm/bun-sql';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import postgres from 'postgres';

export async function migrateBun(
  migrationsFolder: string,
  client: BunSQLDatabase<typeof schema> & {
    $client: Bun.SQL;
  },
  maxAttempts: number = 5,
) {
  const waitForDatabase = async () => {
    let attempts = 0;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await client.$client`SELECT 1`;
        return;
      } catch (error) {
        attempts++;
        console.log(`Database not ready, retrying... (${attempts}/5)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  console.log('Waiting for database to be ready...');
  await waitForDatabase();
  console.log('Database is ready, running migrations...');
  const { migrate } = await import('drizzle-orm/bun-sql/migrator');

  await migrate(client as any, { migrationsFolder });
  console.log('Migrations completed successfully.');
}

export async function migratePostgresJs(
  migrationsFolder: string,
  client: PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
  },
  maxAttempts: number = 5,
) {
  const waitForDatabase = async () => {
    let attempts = 0;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await client.$client`SELECT 1`;
        return;
      } catch (error) {
        attempts++;
        console.log(`Database not ready, retrying... (${attempts}/5)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  console.log('Waiting for database to be ready...');
  await waitForDatabase();
  console.log('Database is ready, running migrations...');
  const { migrate } = await import('drizzle-orm/postgres-js/migrator');

  await migrate(client as any, { migrationsFolder });
  console.log('Migrations completed successfully.');
}

export default async function migrate(
  migrationsFolder: string,
  client:
    | (BunSQLDatabase<typeof schema> & {
        $client: Bun.SQL;
      })
    | (PostgresJsDatabase<typeof schema> & {
        $client: postgres.Sql<{}>;
      }),
  maxAttempts: number = 5,
) {
  if (client instanceof BunSQLDatabase) {
    await migrateBun(
      migrationsFolder,
      client as BunSQLDatabase<typeof schema> & { $client: Bun.SQL },
      maxAttempts,
    );
  } else {
    await migratePostgresJs(
      migrationsFolder,
      client as PostgresJsDatabase<typeof schema> & {
        $client: postgres.Sql<{}>;
      },
      maxAttempts,
    );
  }
}
