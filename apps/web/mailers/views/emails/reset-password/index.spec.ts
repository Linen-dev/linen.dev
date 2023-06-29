import view from '.';

describe('reset password email', () => {
  it('renders a link to the reset password page', () => {
    const html = view({
      url: 'http://localhost:3000/reset-password?token=abc123',
    });
    expect(html).toContain(
      "<a href='http://localhost:3000/reset-password?token=abc123'>http://localhost:3000/reset-password?token=abc123</a>"
    );
  });
});
