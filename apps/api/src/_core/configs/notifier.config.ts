import { registerAs } from '@nestjs/config';

export interface NotifierConfig {
  mailDriver: 'smtp' | 'log';
  phoneDriver: 'zns' | 'sms' | 'zns+sms' | 'log';
}

export default registerAs('notifier', (): NotifierConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mailDriver = process.env.MAIL_DRIVER as NotifierConfig['mailDriver'];
  const phoneDriver = process.env.PHONE_DRIVER as NotifierConfig['phoneDriver'];

  // ─── Refuse to hand a log driver to production ───────────────────────
  if (isProduction && (mailDriver === 'log' || phoneDriver === 'log')) {
    throw new Error('MAIL_DRIVER / PHONE_DRIVER: a log driver must never be bound in production');
  }

  return { mailDriver, phoneDriver };
});
