import { getCsrfToken } from 'utilities/auth/react';

async function signInWithCreds(
  email: string,
  password: string,
  csrfToken: string
) {
  return await fetch(`/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password, csrfToken }),
  }).then((r) => {
    if (r.ok) r.json();
    else throw r.json();
  });
}

async function signInWithMagicLink(
  email: string,
  csrfToken: string,
  opts: { callbackUrl?: string; displayName?: string; state?: string } = {}
) {
  return await fetch(`/api/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination: email, csrfToken, ...opts }),
  }).then((r) => {
    if (r.ok) r.json();
    else throw r.json();
  });
}

export function onSignInSubmit({
  setError,
  setLoading,
  callbackUrl,
  onSignIn,
  state,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  callbackUrl?: string;
  onSignIn?: () => void;
  state?: string;
}) {
  return async (event: any, mode: SignInMode) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const csrfToken = form.csrfToken.value || (await getCsrfToken());

      if (mode === 'creds') {
        const password = form.password.value;
        if (!password) {
          setError('Password is required');
          return;
        }

        await signInWithCreds(email, password, csrfToken);
        if (onSignIn) {
          onSignIn();
        } else {
          window.location.href = callbackUrl || '/';
        }
      }
      if (mode === 'magic') {
        await signInWithMagicLink(email, csrfToken, { callbackUrl, state });
        window.location.href = '/verify-request';
      }
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
}

export function onSignUpWithMagicLink({
  setError,
  setLoading,
  callbackUrl,
  state,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  callbackUrl?: string;
  state?: string;
}) {
  return async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const displayName = form.displayName.value;

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const csrfToken = form?.csrfToken?.value || (await getCsrfToken());

      await signInWithMagicLink(email, csrfToken, {
        callbackUrl,
        displayName,
        state,
      });
      window.location.href = '/verify-request';
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };
}

export function onSignUpWithCredsSubmit({
  setError,
  setLoading,
  state,
  onSignIn,
  callbackUrl,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  state?: string;
  onSignIn?: () => void;
  callbackUrl?: string;
}) {
  return async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    try {
      setLoading(true);
      const signUpResponse = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          ...(!!state && {
            displayName: form.displayName.value,
            accountId: state,
          }),
        }),
      });
      if (!signUpResponse.ok) {
        throw signUpResponse;
      }

      const csrfToken = form?.csrfToken?.value || (await getCsrfToken());

      await signInWithCreds(email, password, csrfToken);
      if (onSignIn) {
        onSignIn();
      } else {
        window.location.href = callbackUrl || '/';
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
}

export const TermsAndPolicy = (
  <p className="text-xs text-gray-600">
    By using the platform, you agree to our{' '}
    <a
      target="_blank"
      className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
      href="/legal/terms"
    >
      Terms
    </a>{' '}
    and{' '}
    <a
      className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
      target="_blank"
      href="/legal/privacy"
    >
      Privacy Policy.
    </a>
  </p>
);

export const AnchorCss =
  'cursor-pointer text-blue-600 hover:text-blue-800 visited:text-purple-600';

export type SignInMode = 'creds' | 'magic';
