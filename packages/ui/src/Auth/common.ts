import { getCsrfToken } from '@linen/auth/client';
import { qs } from '@linen/utilities/url';
import { SignInMode } from '@linen/types';

async function signInWithCreds(
  email: string,
  password: string,
  csrfToken: string,
  sso?: string
) {
  return await fetch(`/api/auth/callback/credentials?${qs({ sso })}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: String(email).toLowerCase(),
      password,
      csrfToken,
    }),
  }).then((r) => {
    if (r.ok) return r.json();
    else throw r.json();
  });
}

async function signInWithMagicLink(
  email: string,
  csrfToken: string,
  options: {
    callbackUrl?: string;
    displayName?: string;
    state?: string;
    sso?: string;
  } = {}
) {
  return await fetch(`/api/auth/magic-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: String(email).toLowerCase(),
      csrfToken,
      ...options,
    }),
  }).then((r) => {
    if (r.ok) return r.json();
    else throw r.json();
  });
}

export function onSignInSubmit({
  setError,
  setLoading,
  callbackUrl,
  onSignIn,
  state,
  sso,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  callbackUrl?: string;
  onSignIn?: () => void;
  state?: string;
  sso?: string;
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

        const signInResponse = await signInWithCreds(
          email,
          password,
          csrfToken,
          sso
        );
        if (onSignIn) {
          onSignIn();
        } else {
          if (sso) {
            callbackUrl += `?state=${signInResponse.state}`;
          }
          window.location.href = callbackUrl || '/';
        }
      }
      if (mode === 'magic') {
        await signInWithMagicLink(email, csrfToken, {
          callbackUrl,
          state,
          sso,
        });
        window.location.href = '/verify-request';
      }
    } catch (exception: any) {
      if (typeof exception.then === 'function') {
        const error = await exception;
        setError(error.message);
      } else {
        setError(exception);
      }
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
  sso,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  callbackUrl?: string;
  state?: string;
  sso?: string;
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
        sso,
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
  sso,
}: {
  setError: (arg: string) => void;
  setLoading: (arg: boolean) => void;
  state?: string;
  onSignIn?: () => void;
  callbackUrl?: string;
  sso?: string;
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
      const signUpResponse = await fetch('/api/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: String(email).toLowerCase(),
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

      const signInResponse = await signInWithCreds(
        email,
        password,
        csrfToken,
        sso
      );
      if (sso) {
        callbackUrl += `?state=${signInResponse.state}`;
      }
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
