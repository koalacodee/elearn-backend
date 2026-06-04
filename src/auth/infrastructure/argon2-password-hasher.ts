import { Injectable } from '@nestjs/common';
import { hash, verify } from 'helpers/argon2';
import { PasswordHasher } from '../domain/services/password-hasher';

@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  hash(plaintext: string): Promise<string> {
    return hash(plaintext);
  }

  verify(passwordHash: string, plaintext: string): Promise<boolean> {
    return verify(passwordHash, plaintext);
  }
}
