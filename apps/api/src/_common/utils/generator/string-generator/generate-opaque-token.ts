import { randomBytes } from 'node:crypto';

// ─── Generate an opaque refresh token ────────────────────────────────
// 32 random bytes = 256 bits of entropy, hex-encoded.
export const generateOpaqueToken = (): string => randomBytes(32).toString('hex');
