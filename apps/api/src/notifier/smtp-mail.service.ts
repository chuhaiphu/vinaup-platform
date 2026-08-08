import { Injectable, Logger } from '@nestjs/common';

import type { MailIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { MailService } from './mail.service';

// ─── DRIVER — SMTP, not integrated yet
@Injectable()
export class SmtpMailService extends MailService {
  private readonly logger = new Logger(SmtpMailService.name);

  send(email: string, intent: MailIntent): Promise<SendOutcome> {
    this.logger.error(
      `${SmtpMailService.name} is not integrated — ${intent.kind} to ${email} was not sent`,
    );
    return Promise.resolve({ delivered: false, reason: 'sender-fault' });
  }
}
