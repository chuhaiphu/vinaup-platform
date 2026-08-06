import { Injectable, Logger } from '@nestjs/common';

import type { PhoneIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { PhoneService } from './phone.service';

// ─── DRIVER — SMS, not integrated yet ────────────────────────────────
@Injectable()
export class SmsPhoneService extends PhoneService {
  private readonly logger = new Logger(SmsPhoneService.name);

  send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    // See smtp-mail.service.ts for why an unintegrated driver reports `sender-fault`.
    this.logger.error(
      `${SmsPhoneService.name} is not integrated — ${intent.kind} to ${phone} was not sent`,
    );
    return Promise.resolve({ delivered: false, reason: 'sender-fault' });
  }
}
