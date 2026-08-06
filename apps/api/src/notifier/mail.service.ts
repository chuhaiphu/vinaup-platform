import type { MailIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

// ─── CONTRACT — everything that delivers to an email address ─────────
// An `abstract class`, not an `interface`:
// a TypeScript interface is erased at compile time and cannot serve as a DI token,
// while an abstract class exists at runtime AND type-checks its drivers.
export abstract class MailService {
  abstract send(email: string, intent: MailIntent): Promise<SendOutcome>;
}
