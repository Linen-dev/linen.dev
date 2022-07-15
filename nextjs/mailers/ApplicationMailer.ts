import nodemailer from 'nodemailer';

const HOST = process.env.EMAIL_HOST;
const USER = process.env.EMAIL_USER;
const PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: HOST,
  port: 465,
  secure: true,
  auth: {
    user: USER,
    pass: PASS,
  },
});

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
