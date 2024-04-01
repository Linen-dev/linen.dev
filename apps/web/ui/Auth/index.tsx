import CardLayout from '@/CardLayout';
import EmailField from '@/EmailField';
import Button from '@/Button';
import PasswordField from '@/PasswordField';
import React, { useEffect, useState } from 'react';
import { qs } from '@linen/utilities/url';
import { onSignInSubmit } from './common';
import GitHubButton from '@/GitHubButton';
import styles from './index.module.scss';
import { SignInMode } from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import { onSignUpWithCredsSubmit, onSignUpWithMagicLink } from './common';
import TextField from '@/TextField';
import Toast from '@/Toast';
import { GoMailRead } from '@react-icons/all-files/go/GoMailRead';
import Alert from '@/Alert';

const TermsAndPolicy = (
  <p className={styles.noAccount}>
    By using the platform, you agree to our{' '}
    <a target="_blank" className={styles.anchorCss} href="/legal/terms">
      Terms
    </a>{' '}
    and{' '}
    <a className={styles.anchorCss} target="_blank" href="/legal/privacy">
      Privacy Policy.
    </a>
  </p>
);

function getErrorMessage(error: string) {
  switch (error) {
    case 'private':
      return 'The community you are trying to access is private.';
    case 'forbidden':
      return 'You are not allowed to access this page.';
    case 'CredentialsSignin':
      return 'Credentials are invalid.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}

function Error({ error }: { error?: string }) {
  if (!error) {
    return null;
  }
  return (
    <div className={styles.pb3}>
      <Alert type="danger">{getErrorMessage(error)}</Alert>
    </div>
  );
}

function prepareUrl(url?: string) {
  const page = localStorage.get('pages.last');
  if (page && url === '/api/router') {
    return `${url}?${qs(page)}`;
  }
  return url;
}

function SignIn({
  csrfToken,
  callbackUrl,
  state,
  withLayout = true,
  showSignUp,
  onSignIn,
  redirectFn,
  origin,
  ...props
}: {
  csrfToken?: string;
  error?: string;
  email?: string;
  callbackUrl?: string;
  state?: string;
  withLayout?: boolean;
  showSignUp?: (mode: SignInMode) => void;
  onSignIn?: () => void;
  sso?: string;
  redirectFn?(url: string): void;
  origin?: string;
  mode: SignInMode;
  setMode?(props: SignInMode): void;
}) {
  const [mode, setMode] = useState<SignInMode>(props.mode || 'magic');
  const [email, setEmail] = useState(props.email);
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
            <p className={styles.forgotPass}>
              <a
                href={`/forgot-password?email=${email || ''}`}
                className={styles.anchorCss}
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
        <hr className={styles.hr} />

        <div className={styles.flexJustifyContent}>
          <p className={styles.noAccount}>
            No account? {/* <br /> */}
            <a
              onClick={() => {
                if (showSignUp) {
                  showSignUp?.(mode);
                } else {
                  window.location.href = `/signup?${qs({
                    callbackUrl,
                    email,
                    mode,
                  })}`;
                }
              }}
              className={styles.anchorCss}
            >
              Sign up for free
            </a>
            .
          </p>
          <p className={styles.w1_3}></p>
          {mode === 'magic' && (
            <p className={styles.smallTextGray700}>
              Prefer passwords? {/* <br /> */}
              <a
                className={styles.anchorCss}
                onClick={() => {
                  setMode('creds');
                  props.setMode && props.setMode('creds');
                }}
              >
                Sign in with credentials
              </a>
              .
            </p>
          )}
          {mode === 'creds' && (
            <p className={styles.smallTextGray700}>
              Prefer email? {/* <br /> */}
              <a
                className={styles.anchorCss}
                onClick={() => {
                  setMode('magic');
                  props.setMode && props.setMode('magic');
                }}
              >
                Sign in with email
              </a>
              .
            </p>
          )}
        </div>
        <div className={styles.hr}></div>
        <GitHubButton
          flow="sign-in"
          callbackUrl={callbackUrl}
          state={state}
          sso={props.sso}
          origin={origin}
          redirectFn={redirectFn}
        />
      </form>
    </Layout>
  );
}

function SignUp({
  csrfToken,
  callbackUrl,
  state,
  withLayout = true,
  showSignIn,
  onSignIn,
  sso,
  redirectFn,
  origin,
  ...props
}: {
  csrfToken?: string;
  email?: string;
  callbackUrl?: string;
  error?: string;
  state?: string;
  mode: SignInMode;
  setMode?(props: SignInMode): void;
  withLayout: boolean;
  showSignIn?: (mode: SignInMode) => void;
  onSignIn?: () => void;
  sso?: string;
  redirectFn?(url: string): void;
  origin?: string;
}) {
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
          sso,
        })
      : onSignUpWithMagicLink({
          setError,
          setLoading,
          callbackUrl,
          state,
          sso,
        });

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

        <hr className={styles.hr} />

        <div className={styles.flexJustifyContent}>
          <p className={styles.noAccount}>
            Already have an account? {/* <br /> */}
            <a
              onClick={() => {
                if (showSignIn) {
                  showSignIn?.(mode);
                } else {
                  window.location.href = `/signin?${qs({
                    callbackUrl,
                    state,
                    email,
                    mode: 'creds',
                    sso,
                  })}`;
                }
              }}
              className={styles.anchorCss}
            >
              Sign in
            </a>
            .
          </p>
          <p className={styles.w1_3}></p>
          {mode === 'creds' && (
            <p className={styles.smallTextGray700}>
              Prefer email? {/* <br /> */}
              <a
                onClick={() => {
                  if (setMode) {
                    props.setMode && props.setMode('magic');
                    setMode?.('magic');
                  } else
                    window.location.href = `/signup?${qs({
                      callbackUrl,
                      state,
                      email,
                      mode: 'magic',
                      sso,
                    })}`;
                }}
                className={styles.anchorCss}
              >
                Sign up with email
              </a>
              .
            </p>
          )}
          {mode === 'magic' && (
            <p className={styles.smallTextGray700}>
              Prefer passwords? {/* <br /> */}
              <a
                onClick={() => {
                  if (setMode) {
                    props.setMode && props.setMode('creds');
                    setMode?.('creds');
                  } else
                    window.location.href = `/signup?${qs({
                      callbackUrl,
                      email,
                      mode: 'creds',
                      sso,
                    })}`;
                }}
                className={styles.anchorCss}
              >
                Sign up with credentials
              </a>
              .
            </p>
          )}
        </div>
        <div className={styles.hr}></div>
        <GitHubButton
          flow="sign-up"
          callbackUrl={callbackUrl}
          state={state}
          sso={sso}
          origin={origin}
          redirectFn={redirectFn}
        />
      </form>
    </Layout>
  );
}

function ResetPassword({ token }: { token: string }) {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const password = form.password.value;
    const passwordConfirmation = form.passwordConfirmation.value;
    if (password !== passwordConfirmation) {
      Toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password, token }),
      });
      if (!response.ok) {
        throw response;
      }
      Toast.success('Password updated.');
      setTimeout(() => {
        window.location.href = '/signin?mode=creds';
      }, 1000);
    } catch (exception) {
      Toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <CardLayout header="Reset Password">
      <form onSubmit={onSubmit}>
        <PasswordField placeholder="Password" id="password" required />
        <PasswordField
          placeholder="Password confirmation"
          id="passwordConfirmation"
          required
        />
        <Button type="submit" block>
          Continue
        </Button>
        <p className={styles.smallTextGray700}>
          Clicking continue will reset your password and redirect you to the
          sign in page.
        </p>
      </form>
    </CardLayout>
  );
}

function ForgotPassword({ email, origin }: { email: string; origin?: string }) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, origin }),
      });
      if (response.ok) {
        Toast.success('Please check your email for a reset link');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 5000);
      } else {
        throw response;
      }
    } catch (exception) {
      setLoading(false);
      Toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <CardLayout header="Forgot Password">
      <form onSubmit={onSubmit}>
        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />
        <Button type="submit" block disabled={loading}>
          Continue
        </Button>
        <p className={styles.smallTextGray700}>
          Clicking continue will send you a reset password link.
        </p>
      </form>
    </CardLayout>
  );
}

function VerifyRequest({}: {}) {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = '/signin';
    }, 5000);
  }, []);
  return (
    <CardLayout>
      <div className={styles.verifyCard}>
        <div>
          <GoMailRead className={styles.verifyIcon} />
          <p className={styles.textCenter}>
            We&apos;ve sent you an email with a link.
            <br />
            Click the link to continue.
          </p>
        </div>
      </div>
    </CardLayout>
  );
}

export default { SignIn, SignUp, ForgotPassword, ResetPassword, VerifyRequest };
