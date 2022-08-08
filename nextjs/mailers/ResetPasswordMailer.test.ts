import ResetPasswordMailer from './ResetPasswordMailer';
import ApplicationMailer from './ApplicationMailer';

jest.mock('./ApplicationMailer');

describe('ResetPasswordMailer', () => {
  it('should send a reset password email', async () => {
    const options = {
      host: 'http://localhost:3000',
      to: 'john@doe.com',
      token: '12345',
    };
    await ResetPasswordMailer.send(options);
    expect(ApplicationMailer.send).toHaveBeenCalledWith({
      to: options.to,
      subject: 'Linen.dev - Reset your password',
      text: `Reset your password here: ${options.host}/reset-password?token=${options.token}`,
      html: `Reset your password here: <a href='${options.host}/reset-password?token=${options.token}'>${options.host}/reset-password?token=${options.token}</a>`,
    });
  });
});
