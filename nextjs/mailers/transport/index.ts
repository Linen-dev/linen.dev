import type SESTransport from 'nodemailer/lib/ses-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { sesClient } from '../../services/aws/ses';

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

const sesTransport = {
  SES: sesClient,
} as SESTransport.Options;

interface TransportOptions {
  SES?: object;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  send?: (data: any, callback: any) => void;
}

const transport: any = {
  test: testTransport,
  development: smtpTransport,
  production: sesTransport,
};

export default transport[NODE_ENV] as TransportOptions;
