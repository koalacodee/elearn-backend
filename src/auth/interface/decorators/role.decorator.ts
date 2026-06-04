import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../domain/user-role.enum';

export const ROLES_KEY = 'auth:roles';

export const Role = (roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
