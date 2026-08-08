import { registerAs } from '@nestjs/config';

const MAIL_DRIVERS = ['smtp', 'log'] as const;
const PHONE_DRIVERS = ['zns', 'sms', 'zns+sms', 'log'] as const;

export type MailDriver = (typeof MAIL_DRIVERS)[number];
export type PhoneDriver = (typeof PHONE_DRIVERS)[number];

export interface NotifierConfig {
  mailDriver: MailDriver;
  phoneDriver: PhoneDriver;
}

const isMailDriver = (value?: string): value is MailDriver =>
  MAIL_DRIVERS.includes(value as MailDriver);

const isPhoneDriver = (value?: string): value is PhoneDriver =>
  PHONE_DRIVERS.includes(value as PhoneDriver);

export default registerAs('notifier', (): NotifierConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mailDriver = process.env.MAIL_DRIVER;
  const phoneDriver = process.env.PHONE_DRIVER;

  // ─── Prove the value belongs to the union before trusting it
  if (!isMailDriver(mailDriver)) {
    throw new Error(
      `MAIL_DRIVER: expected one of ${MAIL_DRIVERS.join(' | ')}, received "${mailDriver ?? ''}"`,
    );
  }
  if (!isPhoneDriver(phoneDriver)) {
    throw new Error(
      `PHONE_DRIVER: expected one of ${PHONE_DRIVERS.join(' | ')}, received "${phoneDriver ?? ''}"`,
    );
  }

  // ─── Refuse to hand a log driver to production
  if (isProduction && (mailDriver === 'log' || phoneDriver === 'log')) {
    throw new Error('MAIL_DRIVER / PHONE_DRIVER: a log driver must never be bound in production');
  }

  return { mailDriver, phoneDriver };
});
