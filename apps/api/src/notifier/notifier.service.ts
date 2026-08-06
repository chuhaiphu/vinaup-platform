import { Injectable, Logger } from '@nestjs/common';

import type { SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { MailService } from './mail.service';
import { PhoneService } from './phone.service';

// ─── FACADE ────────────────────────────
@Injectable()
export class NotifierService {
  private readonly logger = new Logger(NotifierService.name);

  constructor(
    // Both contracts are injected
    private readonly mail: MailService,
    private readonly phone: PhoneService,
  ) {}

  sendSignUpOtpToPhone(phone: string, code: string): void {
    this.dispatch(this.phone.send(phone, { kind: 'SIGN_UP_OTP', code }));
  }

  sendSignInOtpToPhone(phone: string, code: string): void {
    this.dispatch(this.phone.send(phone, { kind: 'SIGN_IN_OTP', code }));
  }

  sendEmailVerificationOtp(email: string, code: string): void {
    this.dispatch(this.mail.send(email, { kind: 'EMAIL_VERIFICATION_OTP', code }));
  }

  sendPasswordResetLinkToEmail(email: string, resetUrl: string): void {
    this.dispatch(this.mail.send(email, { kind: 'PASSWORD_RESET_LINK', resetUrl }));
  }

  sendPasswordResetOtpToEmail(email: string, code: string): void {
    this.dispatch(this.mail.send(email, { kind: 'PASSWORD_RESET_OTP', code }));
  }

  // ─── The single swallow point ────────────────────────────────────────
  private dispatch(sending: Promise<SendOutcome>): void {
    void sending
      .then((outcome) => {
        if (!outcome.delivered) this.logger.error(outcome.reason);
      })
      .catch((error: unknown) => this.logger.error(error));
  }
}
