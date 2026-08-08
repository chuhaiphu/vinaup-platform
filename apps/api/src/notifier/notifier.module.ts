import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import notifierConfig, { NotifierConfig } from 'src/_core/configs/notifier.config';

import { FallbackPhoneService } from './fallback-phone.service';
import { LogMailService } from './log-mail.service';
import { LogPhoneService } from './log-phone.service';
import { MailService } from './mail.service';
import { NotifierService } from './notifier.service';
import { PhoneService } from './phone.service';
import { SmsPhoneService } from './sms-phone.service';
import { SmtpMailService } from './smtp-mail.service';
import { ZnsPhoneService } from './zns-phone.service';

@Module({
  // ─── forFeature: make notifierConfig.KEY injectable HERE
  // The two factories below inject it. 
  // Without this line the container cannot resolve the token and the application fails at startup.
  // It does NOT read .env — forRoot in AppModule did that.
  imports: [ConfigModule.forFeature(notifierConfig)],
  providers: [
    // Every candidate, so the container can construct them.
    SmtpMailService,
    LogMailService,
    ZnsPhoneService,
    SmsPhoneService,
    FallbackPhoneService,
    LogPhoneService,

    // ─── Binding 1 — the MailService token
    {
      provide: MailService,
      useFactory: (config: NotifierConfig, smtp: SmtpMailService, log: LogMailService): MailService => {
        switch (config.mailDriver) {
          case 'smtp':
            return smtp;
          case 'log':
            return log;
        }
      },
      inject: [notifierConfig.KEY, SmtpMailService, LogMailService],
    },

    // ─── Binding 2 — the PhoneService token
    {
      provide: PhoneService,
      useFactory: (
        config: NotifierConfig,
        zns: ZnsPhoneService,
        sms: SmsPhoneService,
        fallback: FallbackPhoneService,
        log: LogPhoneService,
      ): PhoneService => {
        switch (config.phoneDriver) {
          case 'zns':
            return zns;
          case 'sms':
            return sms;
          case 'zns+sms':
            return fallback;
          case 'log':
            return log;
        }
      },
      inject: [notifierConfig.KEY, ZnsPhoneService, SmsPhoneService, FallbackPhoneService, LogPhoneService],
    },

    NotifierService,
  ],
  // Export only the facade.
  // Contracts, drivers and their provider clients stay internal so no other module can name a transport.
  exports: [NotifierService],
})
export class NotifierModule {}
