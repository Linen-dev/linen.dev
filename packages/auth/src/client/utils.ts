interface BroadcastMessage {
  event?: 'session';
  data?: { trigger?: 'signout' | 'getSession' };
  clientId: string;
  timestamp: number;
}

export interface CtxOrReq {
  req?: any;
  ctx?: { req: any };
}

type LoggerInstance = any;

export interface LinenAuthClientConfig {
  basePath: string;
  /** Stores last session response */
  _session?: Session | null | undefined;
  /** Used for timestamp since last synced (in seconds) */
  _lastSync: number;
  /**
   * Stores the `SessionProvider`'s session update method to be able to
   * trigger session updates from places like `signIn` or `signOut`
   */
  _getSession: (...args: any[]) => any;
}

type ISODateString = string;

interface DefaultSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
  expires: ISODateString;
}

export interface Session extends DefaultSession {}

/**
 * If passed 'appContext' via getInitialProps() in _app.js
 * then get the req object from ctx and use that for the
 * req value to allow `fetchData` to
 * work seamlessly in getInitialProps() on server side
 * pages *and* in _app.js.
 */
export async function fetchData<T = any>(
  path: string,
  __LINEN_AUTH: LinenAuthClientConfig,
  logger: LoggerInstance,
  { ctx, req = ctx?.req }: CtxOrReq = {}
): Promise<T | null> {
  const url = `${__LINEN_AUTH.basePath}/${path}`;
  try {
    const token = getJwtToken();
    const options: any = req?.headers.cookie
      ? { headers: { cookie: req.headers.cookie } }
      : {};

    if (!!token) {
      options.headers = {
        ...(options.headers && { ...options.headers }),
        Authorization: `Bearer ${token}`,
      };
    }

    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw data;
    return Object.keys(data).length > 0 ? data : null; // Return null if data empty
  } catch (error: any) {
    logger.error('CLIENT_FETCH_ERROR', { error: error as Error, url });
    return null;
  }
}

/** Returns the number of seconds elapsed since January 1, 1970 00:00:00 UTC. */
export function now() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Inspired by [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
 * Only not using it directly, because Safari does not support it.
 *
 * https://caniuse.com/?search=broadcastchannel
 */
export function BroadcastChannel(name = 'linen.message') {
  return {
    /** Get notified by other tabs/windows. */
    receive(onReceive: (message: BroadcastMessage) => void) {
      const handler = (event: StorageEvent) => {
        if (event.key !== name) return;
        const message: BroadcastMessage = JSON.parse(event.newValue ?? '{}');
        if (message?.event !== 'session' || !message?.data) return;

        onReceive(message);
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
    /** Notify other tabs/windows. */
    post(message: Record<string, unknown>) {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(
          name,
          JSON.stringify({ ...message, timestamp: now() })
        );
      } catch {
        /**
         * The localStorage API isn't always available.
         * It won't work in private mode prior to Safari 11 for example.
         * Notifications are simply dropped if an error is encountered.
         */
      }
    },
  };
}

export function cleanUpStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('jwt');
  localStorage.removeItem('linen.message');
}

export function getJwtToken() {
  if (typeof window === 'undefined') return;
  return localStorage.getItem('jwt');
}

export function setJwtToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('jwt', token);
}
