import ApplicationMailer from './ApplicationMailer';
import view from './views/emails/reset-password';

interface Options {
  host: string;
  to: string;
  token: string;
}

export default class ResetPasswordMailer {
  static async send({ host, to, token }: Options) {
    const url = new URL(`/reset-password?token=${token}`, host).toString();
    return ApplicationMailer.send({
      to,
      subject: 'Linen.dev - Reset your password',
      text: `Reset your password here: ${url}`,
      html: view({ url }),
    });
  }
}
