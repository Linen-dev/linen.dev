import CardLayout from '@linen/ui/Layouts/CardLayout';
import EmailField from '@linen/ui/EmailField';
import Button from '@linen/ui/Button';
import { localStorage } from '@linen/utilities/storage';
import Error from 'components/Auth/Error';
import PasswordField from '@linen/ui/PasswordField';
import { useState } from 'react';
import { qs } from '@linen/utilities/url';
import {
  AnchorCss,
  onSignInSubmit,
  SignInMode,
  TermsAndPolicy,
} from 'components/Auth';
import GitHubButton from 'components/Auth/GitHubButton';

interface SignInProps {
  csrfToken?: string;
  error?: string;
  email?: string;
  callbackUrl?: string;
  state?: string;
  mode?: SignInMode;
  withLayout?: boolean;
  showSignUp?: (arg: SignInMode) => void;
  onSignIn?: () => void;
  sso?: string;
}

function prepareUrl(url?: string) {
  const page = localStorage.get('pages.last');
  if (page && url === '/api/router') {
    return `${url}?${qs(page)}`;
  }
  return url;
}

export default function SignIn({
  csrfToken,
  callbackUrl,
  state,
  withLayout = true,
  showSignUp,
  onSignIn,
  ...props
}: SignInProps) {
  const [email, setEmail] = useState(props.email);
  const [mode, setMode] = useState<SignInMode>(props.mode || 'magic');
  const [error, setError] = useState(props.error);
  const [loading, setLoading] = useState(false);

  const Layout = withLayout
    ? CardLayout
    : (props: any) => <>{props.children}</>;

  const redirectUrl = prepareUrl(callbackUrl);

  return (
    <Layout header="Sign In">
      <Error error={error} />

      <form
        onSubmit={(e) =>
          onSignInSubmit({
            setError,
            setLoading,
            callbackUrl: redirectUrl,
            onSignIn,
            state,
            ...props,
          })(e, mode)
        }
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />

        {mode === 'creds' && (
          <>
            <PasswordField placeholder="Password" id="password" required />
            <p className="text-xs pt-3 text-gray-700 dark:text-gray-100 pb-3">
              <a
                href={`/forgot-password?email=${email || ''}`}
                className={AnchorCss}
              >
                Forgot your password?
              </a>
            </p>
          </>
        )}

        <Button type="submit" block disabled={loading}>
          Continue
        </Button>
        {TermsAndPolicy}
        <hr className="my-5" />

        <div className="flex justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-50">
            No account? {/* <br /> */}
            <a
              onClick={() => {
                if (showSignUp) showSignUp?.(mode);
                else
                  window.location.href = `/signup?${qs({
                    callbackUrl,
                    email,
                    mode,
                  })}`;
              }}
              className={AnchorCss}
            >
              Sign up for free
            </a>
            .
          </p>
          <p className="w-1/3"></p>
          {mode === 'magic' && (
            <p className="text-xs text-gray-700 dark:text-gray-100 pb-3">
              Prefer passwords? {/* <br /> */}
              <a className={AnchorCss} onClick={() => setMode('creds')}>
                Sign in with credentials
              </a>
              .
            </p>
          )}
          {mode === 'creds' && (
            <p className="text-xs text-gray-700 dark:text-gray-100 pb-3">
              Prefer email? {/* <br /> */}
              <a className={AnchorCss} onClick={() => setMode('magic')}>
                Sign in with email
              </a>
              .
            </p>
          )}
        </div>
        <div className="my-5"></div>
        <GitHubButton flow="sign-in" callbackUrl={callbackUrl} state={state} />
      </form>
    </Layout>
  );
}
