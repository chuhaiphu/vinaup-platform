import { Injectable, Logger } from '@nestjs/common';

import type { PhoneIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { PhoneService } from './phone.service';

// ─── DRIVER — app-messaging, not integrated yet ──────────────────────
@Injectable()
export class ZnsPhoneService extends PhoneService {
  private readonly logger = new Logger(ZnsPhoneService.name);

  send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    // See smtp-mail.service.ts for why an unintegrated driver reports `sender-fault`.
    this.logger.error(
      `${ZnsPhoneService.name} is not integrated — ${intent.kind} to ${phone} was not sent`,
    );
    return Promise.resolve({ delivered: false, reason: 'sender-fault' });
  }
}
