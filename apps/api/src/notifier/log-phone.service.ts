import { Injectable, Logger } from '@nestjs/common';

import type { PhoneIntent, SendOutcome } from 'src/_common/interfaces/notifier.interface';

import { PhoneService } from './phone.service';

@Injectable()
export class LogPhoneService extends PhoneService {
  private readonly logger = new Logger(LogPhoneService.name);

  send(phone: string, intent: PhoneIntent): Promise<SendOutcome> {
    this.logger.log(`${intent.kind} → ${phone} : ${intent.code}`);
    return Promise.resolve({ delivered: true });
  }
}
