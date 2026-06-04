export async function hash(plaintext: string) {
  if (Bun != undefined) {
    return Bun.password.hash(plaintext);
  } else {
    const { hash: argon2Hash } = await import('argon2');
    return argon2Hash(plaintext);
  }
}

export async function verify(hash: string, plaintext: string) {
  if (Bun != undefined) {
    return Bun.password.verify(plaintext, hash);
  } else {
    const { verify: argon2Verify } = await import('argon2');
    return argon2Verify(hash, plaintext);
  }
}
