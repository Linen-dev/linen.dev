import nodemailer from 'nodemailer';
import transport from './transport';
import { NOREPLY_EMAIL } from 'config';

const transporter = nodemailer.createTransport(transport);

interface Options {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class ApplicationMailer {
  static async send(options: Options) {
    if (!process.env.EMAIL_HOST) {
      return;
    }
    return transporter.sendMail({
      ...options,
      from: NOREPLY_EMAIL,
    });
  }
}

export default ApplicationMailer;
