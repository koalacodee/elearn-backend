import { uuidv7 as genUuidv7 } from 'uuidv7';

export function uuidv7() {
  if (Bun !== undefined) {
    return Bun.randomUUIDv7();
  } else {
    return genUuidv7();
  }
}
