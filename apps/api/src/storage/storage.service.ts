// ─── StorageService: the storage CONTRACT ───────────────────────────
// Abstract class, not interface: TS interfaces are erased at compile time,
// so they cannot serve as a DI token.
export abstract class StorageService {
  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract getPublicUrl(key: string): string;
}
