import { Injectable, Logger } from '@nestjs/common';

import type { MailIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { MailService } from './mail.service';

@Injectable()
export class LogMailService extends MailService {
  private readonly logger = new Logger(LogMailService.name);

  send(email: string, intent: MailIntent): Promise<SendOutcome> {
    this.logger.log(`${intent.kind} → ${email} : ${this.getSecret(intent)}`);
    return Promise.resolve({ delivered: true });
  }

  private getSecret(intent: MailIntent): string {
    switch (intent.kind) {
      case 'EMAIL_VERIFICATION_OTP':
        return intent.code;
      case 'PASSWORD_RESET_OTP':
        return intent.code;
      case 'PASSWORD_RESET_LINK':
        return intent.resetUrl;
    }
  }
}
