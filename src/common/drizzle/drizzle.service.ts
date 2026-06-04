import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BunSQLDatabase, drizzle } from 'drizzle-orm/bun-sql';
import {
  PostgresJsDatabase,
  drizzle as postgresJsDrizzle,
} from 'drizzle-orm/postgres-js';
import migrate from 'drizzle/migrate';
import * as schema from 'drizzle/schema';
import postgres from 'postgres';

@Injectable()
export class DrizzleService implements OnModuleInit {
  db:
    | (BunSQLDatabase<typeof schema> & {
        $client: Bun.SQL;
      })
    | (PostgresJsDatabase<typeof schema> & {
        $client: postgres.Sql<{}>;
      });
  private migrationsFolder: string | null;
  private isBun: boolean = typeof Bun !== 'undefined';
  constructor(private config: ConfigService) {
    let url = this.config.getOrThrow<string>('drizzle.databaseUrl');
    if (this.isBun) {
      const client = new Bun.SQL(url);
      this.db = drizzle({ client, schema });
    } else {
      const client = postgres(url);
      this.db = postgresJsDrizzle({ client, schema });
    }
  }

  async onModuleInit() {
    this.migrationsFolder =
      this.config.get<string>('drizzle.migrationsFolder') ?? null;

    if (this.migrationsFolder) {
      await migrate(this.migrationsFolder, this.db);
    }
  }
}
