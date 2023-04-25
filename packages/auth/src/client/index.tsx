import * as React from 'react';
import {
  BroadcastChannel,
  fetchData,
  now,
  cleanUpStorage,
  Session,
  LinenAuthClientConfig,
  CtxOrReq,
} from './utils';

export {
  BroadcastChannel,
  fetchData,
  now,
  cleanUpStorage,
  Session,
  LinenAuthClientConfig,
  CtxOrReq,
};

interface UseSessionOptions<R extends boolean> {
  required: R;
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void;
}

type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

interface ClientSafeProvider {
  id: LiteralUnion<BuiltInProviderType>;
  name: string;
  type: ProviderType;
  signinUrl: string;
  callbackUrl: string;
}

interface SignInOptions extends Record<string, unknown> {
  callbackUrl?: string;
  redirect?: boolean;
}

interface SignInResponse {
  error: string | undefined;
  status: number;
  ok: boolean;
  url: string | null;
}

type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

interface SignOutResponse {
  url: string;
}

interface SignOutParams<R extends boolean = true> {
  callbackUrl?: string;
  redirect?: R;
}

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
  baseUrl?: string;
  basePath?: string;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
  refetchWhenOffline?: false;
}

type BuiltInProviderType = any;
type RedirectableProviderType = any;
type ProviderType = any;

interface InternalUrl {
  /** @default "http://localhost:3000" */
  origin: string;
  /** @default "localhost:3000" */
  host: string;
  /** @default "/api/auth" */
  path: string;
  /** @default "http://localhost:3000/api/auth" */
  base: string;
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string;
}

type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
};

type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { data: Session; status: 'authenticated' }
      | { data: null; status: 'loading' }
  :
      | { data: Session; status: 'authenticated' }
      | { data: null; status: 'unauthenticated' | 'loading' };

interface DefaultJWT extends Record<string, unknown> {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
}

export interface JWT extends Record<string, unknown>, DefaultJWT {}

// This behavior mirrors the default behavior for getting the site name that
// happens server side in server/index.js
// 1. An empty value is legitimate when the code is being invoked client side as
//    relative URLs are valid in that context and so defaults to empty.
// 2. When invoked server side the value is picked up from an environment
//    variable and defaults to 'http://localhost:3000'.
const __LINEN_AUTH: LinenAuthClientConfig = {
  basePath: '/api/auth',
  _lastSync: 0,
  _session: undefined,
  _getSession: () => {},
};

const broadcast = BroadcastChannel();

const logger = console;

function useOnline() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );

  const setOnline = () => setIsOnline(true);
  const setOffline = () => setIsOnline(false);

  React.useEffect(() => {
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  return isOnline;
}

export const SessionContext = React.createContext?.<
  SessionContextValue | undefined
>(undefined);

/**
 * React Hook that gives you access
 * to the logged in user's session data.
 *
 */
export function useSession<R extends boolean>(options?: UseSessionOptions<R>) {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  // @ts-expect-error Satisfy TS if branch on line below
  const value: SessionContextValue<R> = React.useContext(SessionContext);
  if (!value && process.env.NODE_ENV !== 'production') {
    throw new Error('`useSession` must be wrapped in a <SessionProvider />');
  }

  const { required, onUnauthenticated } = options ?? {};

  const requiredAndNotLoading = required && value.status === 'unauthenticated';

  React.useEffect(() => {
    if (requiredAndNotLoading) {
      const url = `${__LINEN_AUTH.basePath}/signin?${new URLSearchParams({
        error: 'SessionRequired',
        callbackUrl: window.location.href,
      })}`;
      if (onUnauthenticated) onUnauthenticated();
      else window.location.href = url;
    }
  }, [requiredAndNotLoading, onUnauthenticated]);

  if (requiredAndNotLoading) {
    return { data: value.data, status: 'loading' } as const;
  }

  return value;
}

export async function getSession(params?: GetSessionParams) {
  const session = await fetchData<Session>(
    'session',
    __LINEN_AUTH,
    logger,
    params
  );
  if (params?.broadcast ?? true) {
    broadcast.post({ event: 'session', data: { trigger: 'getSession' } });
  }
  return session;
}

/**
 * Returns the current Cross Site Request Forgery Token (CSRF Token)
 * required to make POST requests (e.g. for signing in and signing out).
 * You likely only need to use this if you are not using the built-in
 * `signIn()` and `signOut()` methods.
 *
 */
export async function getCsrfToken(params?: CtxOrReq) {
  if (typeof window === 'undefined') {
    return;
  }
  const response = await fetchData<{ csrfToken: string }>(
    'csrf',
    __LINEN_AUTH,
    logger,
    params
  );
  return response?.csrfToken;
}

/**
 * It calls `/api/auth/providers` and returns
 * a list of the currently configured authentication providers.
 * It can be useful if you are creating a dynamic custom sign in page.
 *
 */
export async function getProviders() {
  return await fetchData<
    Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>
  >('providers', __LINEN_AUTH, logger);
}

/**
 * Client-side method to initiate a signin flow
 * or send the user to the signin page listing all possible providers.
 * Automatically adds the CSRF token to the request.
 *
 */
export async function signIn<
  P extends RedirectableProviderType | undefined = undefined
>(
  provider?: LiteralUnion<
    P extends RedirectableProviderType
      ? P | BuiltInProviderType
      : BuiltInProviderType
  >,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
): Promise<
  P extends RedirectableProviderType ? SignInResponse | undefined : undefined
> {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};

  const baseUrl = __LINEN_AUTH.basePath;
  const providers = await getProviders();

  if (!providers) {
    window.location.href = `${baseUrl}/error`;
    return;
  }

  if (!provider || !(provider in providers)) {
    window.location.href = `${baseUrl}/signin?${new URLSearchParams({
      callbackUrl,
    })}`;
    return;
  }

  const isCredentials = providers[provider].type === 'credentials';
  const isEmail = providers[provider].type === 'email';
  const isSupportingReturn = isCredentials || isEmail;

  const signInUrl = `${baseUrl}/${
    isCredentials ? 'callback' : 'signin'
  }/${provider}`;

  const _signInUrl = `${signInUrl}?${new URLSearchParams(authorizationParams)}`;

  const res = await fetch(_signInUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error
    body: new URLSearchParams({
      ...options,
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  });

  const data = await res.json();

  // TODO: Do not redirect for Credentials and Email providers by default in next major
  if (redirect || !isSupportingReturn) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#')) window.location.reload();
    return;
  }

  const error = new URL(data.url).searchParams.get('error');

  if (res.ok) {
    await __LINEN_AUTH._getSession({ event: 'storage' });
  }

  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any;
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 */
export async function signOut<R extends boolean = true>(
  options?: SignOutParams<R>
): Promise<R extends true ? undefined : SignOutResponse> {
  const { callbackUrl = window.location.href } = options ?? {};
  const baseUrl = __LINEN_AUTH.basePath;
  const fetchOptions = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error
    body: new URLSearchParams({
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  };
  const res = await fetch(`${baseUrl}/signout`, fetchOptions);
  const data = await res.json();
  cleanUpStorage();

  broadcast.post({ event: 'session', data: { trigger: 'signout' } });

  window.location.href = callbackUrl;
  await __LINEN_AUTH._getSession({ event: 'storage' });

  return data;
}

/**
 * Provider to wrap the app in to make session data available globally.
 * Can also be used to throttle the number of requests to the endpoint
 * `/api/auth/session`.
 *
 */
export function SessionProvider(props: SessionProviderProps) {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components');
  }

  const { children, basePath, refetchInterval, refetchWhenOffline } = props;

  if (basePath) __LINEN_AUTH.basePath = basePath;

  /**
   * If session was `null`, there was an attempt to fetch it,
   * but it failed, but we still treat it as a valid initial value.
   */
  const hasInitialSession = props.session !== undefined;

  /** If session was passed, initialize as already synced */
  __LINEN_AUTH._lastSync = hasInitialSession ? now() : 0;

  const [session, setSession] = React.useState(() => {
    if (hasInitialSession) __LINEN_AUTH._session = props.session;
    return props.session;
  });

  /** If session was passed, initialize as not loading */
  const [loading, setLoading] = React.useState(!hasInitialSession);

  React.useEffect(() => {
    __LINEN_AUTH._getSession = async ({ event }: any = {}) => {
      try {
        const storageEvent = event === 'storage';
        // We should always update if we don't have a client session yet
        // or if there are events from other tabs/windows
        if (storageEvent || __LINEN_AUTH._session === undefined) {
          __LINEN_AUTH._lastSync = now();
          __LINEN_AUTH._session = await getSession({
            broadcast: !storageEvent,
          });
          setSession(__LINEN_AUTH._session);
          return;
        }

        if (
          // If there is no time defined for when a session should be considered
          // stale, then it's okay to use the value we have until an event is
          // triggered which updates it
          !event ||
          // If the client doesn't have a session then we don't need to call
          // the server to check if it does (if they have signed in via another
          // tab or window that will come through as a "storage" event
          // event anyway)
          __LINEN_AUTH._session === null ||
          // Bail out early if the client session is not stale yet
          now() < __LINEN_AUTH._lastSync
        ) {
          return;
        }

        // An event or session staleness occurred, update the client session.
        __LINEN_AUTH._lastSync = now();
        __LINEN_AUTH._session = await getSession();
        setSession(__LINEN_AUTH._session);
      } catch (error) {
        logger.error('CLIENT_SESSION_ERROR', error as Error);
      } finally {
        setLoading(false);
      }
    };

    __LINEN_AUTH._getSession();

    return () => {
      __LINEN_AUTH._lastSync = 0;
      __LINEN_AUTH._session = undefined;
      __LINEN_AUTH._getSession = () => {};
    };
  }, []);

  React.useEffect(() => {
    // Listen for storage events and update session if event fired from
    // another window (but suppress firing another event to avoid a loop)
    // Fetch new session data but tell it to not to fire another event to
    // avoid an infinite loop.
    // Note: We could pass session data through and do something like
    // `setData(message.data)` but that can cause problems depending
    // on how the session object is being used in the client; it is
    // more robust to have each window/tab fetch it's own copy of the
    // session object rather than share it across instances.
    const unsubscribe = broadcast.receive(() =>
      __LINEN_AUTH._getSession({ event: 'storage' })
    );

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const { refetchOnWindowFocus = true } = props;
    // Listen for when the page is visible, if the user switches tabs
    // and makes our tab visible again, re-fetch the session, but only if
    // this feature is not disabled.
    const visibilityHandler = () => {
      if (refetchOnWindowFocus && document.visibilityState === 'visible')
        __LINEN_AUTH._getSession({ event: 'visibilitychange' });
    };
    document.addEventListener('visibilitychange', visibilityHandler, false);
    return () =>
      document.removeEventListener(
        'visibilitychange',
        visibilityHandler,
        false
      );
  }, [props.refetchOnWindowFocus]);

  const isOnline = useOnline();
  // TODO: Flip this behavior in next major version
  const shouldRefetch = refetchWhenOffline !== false || isOnline;

  React.useEffect(() => {
    if (refetchInterval && shouldRefetch) {
      const refetchIntervalTimer = setInterval(() => {
        if (__LINEN_AUTH._session) {
          __LINEN_AUTH._getSession({ event: 'poll' });
        }
      }, refetchInterval * 1000);
      return () => clearInterval(refetchIntervalTimer);
    }
  }, [refetchInterval, shouldRefetch]);

  const value: any = React.useMemo(
    () => ({
      data: session,
      status: loading
        ? 'loading'
        : session
        ? 'authenticated'
        : 'unauthenticated',
    }),
    [session, loading]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
