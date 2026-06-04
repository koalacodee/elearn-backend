import { User } from '../user.entity';
import { UserRole } from '../user-role.enum';

export interface CreateUserInput {
  phone: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
}

export abstract class UserRepository {
  abstract create(input: CreateUserInput): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByPhone(phone: string): Promise<User | null>;
}
