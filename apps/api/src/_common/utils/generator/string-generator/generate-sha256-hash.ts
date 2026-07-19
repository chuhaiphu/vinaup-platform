import { createHash } from 'node:crypto';

export const generateSha256Hash = (raw: string): string => createHash('sha256').update(raw).digest('hex');
