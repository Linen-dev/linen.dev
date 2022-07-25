import type SESTransport from 'nodemailer/lib/ses-transport';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { sesClient } from '../../services/aws/ses';

const NODE_ENV = process.env.NODE_ENV || 'development';

const sesTransport: SESTransport.Options = {
  SES: sesClient,
};

const smtpTransport: SMTPTransport.Options = {
  host: process.env.EMAIL_HOST as string,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASS as string,
  },
};

const transport = {
  // smtp
  test: smtpTransport,
  development: smtpTransport,
  dev: smtpTransport,
  // ses
  production: sesTransport,
};

export default transport[NODE_ENV] as
  | SESTransport.Options
  | SMTPTransport.Options;
