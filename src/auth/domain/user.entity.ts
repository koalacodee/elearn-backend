import { UserRole } from './user-role.enum';

export interface User {
  id: string;
  phone: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
