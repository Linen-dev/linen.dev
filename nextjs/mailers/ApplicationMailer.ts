import nodemailer from 'nodemailer';
import transport from './transport';

const transporter = nodemailer.createTransport(transport);

interface Options {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

class ApplicationMailer {
  static async send(options: Options) {
    return transporter.sendMail({
      ...options,
      from: options.from || 'no-reply@linendev.com',
    });
  }
}

export default ApplicationMailer;
