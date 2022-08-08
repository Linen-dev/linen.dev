import ApplicationMailer from './ApplicationMailer';

interface Options {
  host: string;
  to: string;
  token: string;
}

function html({ host, token }: { host: string; token: string }) {
  return `
    <html>
      <body>
        Reset your password here: <a href='${host}/reset-password?token=${token}'>${host}/reset-password?token=${token}</a>
      </body>
    </html>
  `;
}

export default class ResetPasswordMailer {
  static async send({ host, to, token }: Options) {
    return ApplicationMailer.send({
      to,
      subject: 'Linen.dev - Reset your password',
      text: `Reset your password here: ${host}/reset-password?token=${token}`,
      html: html({ host, token }),
    });
  }
}
