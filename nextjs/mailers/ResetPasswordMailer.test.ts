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
    const { mock } = ApplicationMailer.send as jest.Mock;
    expect(mock.calls).toHaveLength(1);
    const args = mock.calls[0][0];
    expect(args.to).toBe('john@doe.com');
    expect(args.subject).toEqual('Linen.dev - Reset your password');
    expect(args.html).toContain(
      "<a href='http://localhost:3000/reset-password?token=12345'>"
    );
  });
});
