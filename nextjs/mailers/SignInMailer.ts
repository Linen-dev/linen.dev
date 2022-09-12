import ApplicationMailer from './ApplicationMailer';
import view from './views/emails/signin';

interface Options {
  to: string;
  url: string;
}

export default class SignInMailer {
  static async send({ url, to }: Options) {
    return ApplicationMailer.send({
      to,
      subject: 'Sign in to Linen.dev',
      text: `Sign in to Linen.dev\n${url}`,
      html: view({ url }),
    });
  }
}
