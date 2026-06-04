import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from 'drizzle/schema';
import { DrizzleService } from '../../common/drizzle/drizzle.service';
import { User } from '../domain/user.entity';
import { UserRole } from '../domain/user-role.enum';
import {
  CreateUserInput,
  UserRepository,
} from '../domain/repositories/user.repository';

type UserRow = typeof users.$inferSelect;

@Injectable()
export class DrizzleUserRepository extends UserRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async create(input: CreateUserInput): Promise<User> {
    const [row] = await this.drizzle.db
      .insert(users)
      .values({
        phone: input.phone,
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role ?? UserRole.STUDENT,
      })
      .returning();
    return this.toEntity(row);
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const row = await this.drizzle.db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: UserRow): User {
    return {
      id: row.id,
      phone: row.phone,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role as UserRole,
      createdAt: row.createdAt,
    };
  }
}
