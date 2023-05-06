import nodemailer from 'nodemailer';
import transport from './transport';
import { NOREPLY_EMAIL } from 'secrets';

const transporter = nodemailer.createTransport(transport);

interface Options {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class ApplicationMailer {
  static async send(options: Options) {
    return transporter
      .sendMail({
        ...options,
        from: NOREPLY_EMAIL,
      })
      .catch(() => console.log('it should skip mailing when missing envs'));
  }
}

export default ApplicationMailer;
