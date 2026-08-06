import type { PhoneIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

// ─── CONTRACT — everything that delivers to a phone number ───────────
// An `abstract class`, not an `interface`:
// a TypeScript interface is erased at compile time and cannot serve as a DI token,
// while an abstract class exists at runtime AND type-checks its drivers.
export abstract class PhoneService {
  abstract send(phone: string, intent: PhoneIntent): Promise<SendOutcome>;
}
