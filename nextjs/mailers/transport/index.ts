import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const NODE_ENV = process.env.NODE_ENV || 'development';

const testTransport = {
  host: 'smtp.linen.dev',
  port: 465,
  secure: true,
  auth: { user: 'linen@linen.dev', pass: 'linen' },
  send(data: any, callback: any) {
    callback();
  },
} as SMTPTransport.Options;

const smtpTransport = {
  host: process.env.EMAIL_HOST as string,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
} as SMTPTransport.Options;

const transport: Record<
  'development' | 'production' | 'test',
  SMTPTransport.Options
> = {
  test: testTransport,
  development: smtpTransport,
  production: smtpTransport,
};

export default transport[NODE_ENV] as SMTPTransport.Options;
