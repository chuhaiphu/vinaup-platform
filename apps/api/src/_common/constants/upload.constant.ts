export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Matcher for NestJS FileTypeValidator (compared against the magic-number-detected type).
// Derived from ALLOWED_MIME_TYPES so the allow-list stays the single source.
export const ALLOWED_MIME_REGEX = new RegExp(`^(${ALLOWED_MIME_TYPES.join('|')})$`);
