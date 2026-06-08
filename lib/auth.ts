import crypto from 'crypto';

export function verifyBearerToken(authHeader: string | null): boolean {
  const secret = process.env.MINDLOOM_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!authHeader?.startsWith('Bearer ')) return false;

  const provided = authHeader.slice(7);
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length) {
      // Length mismatch — still do a comparison to avoid timing leaks via early return
      crypto.timingSafeEqual(Buffer.alloc(b.length), b);
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function generatePublicToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}
