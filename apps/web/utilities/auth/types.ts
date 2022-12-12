export type ISODateString = string;

export interface DefaultSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string | null;
  };
  expires: ISODateString;
}

/**
 * Returned by `useSession`, `getSession`, returned by the `session` callback
 * and also the shape received as a prop on the `SessionProvider` React Context
 *
 */
export interface Session extends DefaultSession {}

export interface UseSessionOptions<R extends boolean> {
  required: R;
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void;
}

/**
 * Util type that matches some strings literally, but allows any other string as well.
 * @source https://github.com/microsoft/TypeScript/issues/29729#issuecomment-832522611
 */
export type LiteralUnion<T extends U, U = string> =
  | T
  | (U & Record<never, never>);

export interface ClientSafeProvider {
  id: LiteralUnion<BuiltInProviderType>;
  name: string;
  type: ProviderType;
  signinUrl: string;
  callbackUrl: string;
}

export interface SignInOptions extends Record<string, unknown> {
  /**
   * Specify to which URL the user will be redirected after signing in. Defaults to the page URL the sign-in is initiated from.
   *
   */
  callbackUrl?: string;
  redirect?: boolean;
}

export interface SignInResponse {
  error: string | undefined;
  status: number;
  ok: boolean;
  url: string | null;
}

/** Match `inputType` of `new URLSearchParams(inputType)` */
export type SignInAuthorizationParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

export interface SignOutResponse {
  url: string;
}

export interface SignOutParams<R extends boolean = true> {
  callbackUrl?: string;
  redirect?: R;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
  baseUrl?: string;
  basePath?: string;
  /**
   * A time interval (in seconds) after which the session will be re-fetched.
   * If set to `0` (default), the session is not polled.
   */
  refetchInterval?: number;
  /**
   * `SessionProvider` automatically refetches the session when the user switches between windows.
   * This option activates this behavior if set to `true` (default).
   */
  refetchOnWindowFocus?: boolean;
  /**
   * Set to `false` to stop polling when the device has no internet access offline (determined by `navigator.onLine`)
   *
   * [`navigator.onLine` documentation](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine)
   */
  refetchWhenOffline?: false;
}

export type BuiltInProviderType = any;
export type RedirectableProviderType = any;
export type ProviderType = any;
export type LoggerInstance = any;
import { CookieSerializeOptions } from 'cookie';
import type { IncomingMessage } from 'http';

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

export interface CtxOrReq {
  req?: IncomingMessage;
  ctx?: { req: IncomingMessage };
}

export interface InternalUrl {
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

export type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string;
  triggerEvent?: boolean;
  broadcast?: boolean;
};

export type SessionContextValue<R extends boolean = false> = R extends true
  ?
      | { data: Session; status: 'authenticated' }
      | { data: null; status: 'loading' }
  :
      | { data: Session; status: 'authenticated' }
      | { data: null; status: 'unauthenticated' | 'loading' };

export interface BroadcastMessage {
  event?: 'session';
  data?: { trigger?: 'signout' | 'getSession' };
  clientId: string;
  timestamp: number;
}

export interface DefaultJWT extends Record<string, unknown> {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
}
/**
 * Returned by the `jwt` callback and `getToken`, when using JWT sessions
 *
 */
export interface JWT extends Record<string, unknown>, DefaultJWT {}

export interface Cookie {
  name: string;
  value: string;
  options: CookieSerializeOptions;
}
