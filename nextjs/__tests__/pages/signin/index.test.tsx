import { render } from '@testing-library/react';
import Signin from '../../../pages/signin/index';

describe('Signin', () => {
  it('renders a header', () => {
    const { container } = render(<Signin csrfToken="1234" verified={false} />);
    expect(container).toHaveTextContent('Sign In');
  });

  it('renders an alert for a verified account', () => {
    const { container } = render(<Signin csrfToken="1234" verified />);
    expect(container).toHaveTextContent(
      'Your account has been verified correctly.'
    );
  });

  it('renders an error when credentials are invalid', () => {
    const { container } = render(
      <Signin csrfToken="1234" verified={false} error="CredentialsSignin" />
    );
    expect(container).toHaveTextContent('Credentials are invalid.');
  });

  it('renders a standard message for other errors', () => {
    const { container } = render(
      <Signin csrfToken="1234" verified={false} error="UnknownError" />
    );
    expect(container).toHaveTextContent(
      'An unexpected error occurred. Please try again later.'
    );
  });
});
