import CardLayout from '@linen/ui/Layouts/CardLayout';
import { useState } from 'react';
import Error from 'components/Auth/Error';
import {
  AnchorCss,
  onSignUpWithCredsSubmit,
  onSignUpWithMagicLink,
  SignInMode,
  TermsAndPolicy,
} from 'components/Auth';
import TextField from '@linen/ui/TextField';
import EmailField from '@linen/ui/EmailField';
import Button from '@linen/ui/Button';
import PasswordField from '@linen/ui/PasswordField';
import { qs } from '@linen/utilities/url';
import GitHubButton from 'components/Auth/GitHubButton';

export interface SignUpProps {
  csrfToken?: string;
  email?: string;
  callbackUrl?: string;
  error?: string;
  state?: string;
  mode: SignInMode;
  withLayout: boolean;
  showSignIn?: (mode: SignInMode) => void;
  onSignIn?: () => void;
}

export default function SignUp({
  csrfToken,
  callbackUrl,
  state,
  withLayout = true,
  showSignIn,
  onSignIn,
  ...props
}: SignUpProps) {
  const [mode, setMode] = useState<SignInMode>(props.mode || 'magic');
  const [error, setError] = useState(props.error);
  const [email, setEmail] = useState(props.email);
  const [loading, setLoading] = useState(false);

  const Layout = withLayout
    ? CardLayout
    : (props: any) => <>{props.children}</>;

  const onSubmit = (mode: SignInMode) =>
    mode === 'creds'
      ? onSignUpWithCredsSubmit({
          setError,
          setLoading,
          state,
          onSignIn,
          callbackUrl,
        })
      : onSignUpWithMagicLink({ setError, setLoading, callbackUrl, state });

  return (
    <Layout header="Sign Up">
      <Error error={error} />
      <form onSubmit={onSubmit(mode)}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <TextField
          placeholder="Display name"
          id="displayName"
          {...{
            minLength: 1,
            maxLength: 30,
          }}
        />

        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />

        {mode === 'creds' && (
          <PasswordField placeholder="Password" id="password" required />
        )}

        <Button type="submit" block disabled={loading}>
          Continue
        </Button>

        {TermsAndPolicy}

        <hr className="my-5" />

        <div className="flex justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-100">
            Already have an account? {/* <br /> */}
            <a
              onClick={() => {
                if (showSignIn) showSignIn?.(mode);
                else
                  window.location.href = `/signin?${qs({
                    callbackUrl,
                    state,
                    email,
                    mode: 'creds',
                  })}`;
              }}
              className={AnchorCss}
            >
              Sign in
            </a>
            .
          </p>
          <p className="w-1/3"></p>
          {mode === 'creds' && (
            <p className="text-xs text-gray-600 dark:text-gray-100">
              Prefer email? {/* <br /> */}
              <a
                onClick={() => {
                  if (setMode) setMode?.('magic');
                  else
                    window.location.href = `/signup?${qs({
                      callbackUrl,
                      state,
                      email,
                      mode: 'magic',
                    })}`;
                }}
                className={AnchorCss}
              >
                Sign up with email
              </a>
              .
            </p>
          )}
          {mode === 'magic' && (
            <p className="text-xs  text-gray-600 dark:text-gray-100 mb-3">
              Prefer passwords? {/* <br /> */}
              <a
                onClick={() => {
                  if (setMode) setMode?.('creds');
                  else
                    window.location.href = `/signup?${qs({
                      callbackUrl,
                      email,
                      mode: 'creds',
                    })}`;
                }}
                className={AnchorCss}
              >
                Sign up with credentials
              </a>
              .
            </p>
          )}
        </div>
        <div className="my-5"></div>
        <GitHubButton flow="sign-up" callbackUrl={callbackUrl} state={state} />
      </form>
    </Layout>
  );
}
