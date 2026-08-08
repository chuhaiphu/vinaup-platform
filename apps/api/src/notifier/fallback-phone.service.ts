import { Injectable } from '@nestjs/common';

import type { PhoneIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { PhoneService } from './phone.service';
import { SmsPhoneService } from './sms-phone.service';
import { ZnsPhoneService } from './zns-phone.service';

// ─── DRIVER — a chain of two of its siblings
// A driver like any other: it just implements the send by delegating. Neither ZnsPhoneService nor
// SmsPhoneService knows the chain exists, so enabling, disabling or reordering it is one env value
// (PHONE_DRIVER) and no change inside a driver.
//
// This class is the ONLY reader of `reason` — the reason `SendOutcome` cannot be void.
@Injectable()
export class FallbackPhoneService extends PhoneService {
  constructor(
    private readonly zns: ZnsPhoneService,
    private readonly sms: SmsPhoneService,
  ) {
    super();
  }

  async send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    const primaryTry = await this.zns.send(phone, intent);
    // Stop on `sender-fault`: our request was wrong (key, template, payload), so the second driver
    // would spend money to fail the same way. Every other failure is worth one more attempt.
    if (primaryTry.delivered || primaryTry.reason === 'sender-fault') return primaryTry;
    return this.sms.send(phone, intent);
  }
}
