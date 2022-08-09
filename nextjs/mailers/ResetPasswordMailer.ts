import ApplicationMailer from './ApplicationMailer';

interface Options {
  host: string;
  to: string;
  token: string;
}

function html(children: string) {
  return `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${children.trim()}
      </body>
    </html>
  `.trim();
}

function template({ host, token }: { host: string; token: string }) {
  return html(`
    Reset your password here: <a href='${host}/reset-password?token=${token}'>${host}/reset-password?token=${token}</a>
  `);
}

export default class ResetPasswordMailer {
  static async send({ host, to, token }: Options) {
    return ApplicationMailer.send({
      to,
      subject: 'Linen.dev - Reset your password',
      text: `Reset your password here: ${host}/reset-password?token=${token}`,
      html: template({ host, token }),
    });
  }
}
