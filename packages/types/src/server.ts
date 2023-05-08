import type { accounts, users } from '@linen/database';
import {
  type Request as eRequest,
  type Response as eResponse,
  type NextFunction as eNextFunction,
} from 'express';

export type Response = eResponse;
export type Request = eRequest;
export type NextFunction = eNextFunction;

export type AuthedRequest<
  Params = any,
  ResBody = any,
  Body = any,
  Query = any
> = eRequest<Params, ResBody, Body, Query> & {
  session_user?: {
    users: users[];
    email: string;
    id: string;
    exp?: number;
  } | null;
};

export type AuthedRequestWithBody<Body> = AuthedRequest<any, any, Body, any>;

export type AuthedRequestWithTenant<Body = any> = AuthedRequest<
  any,
  any,
  Body,
  any
> & {
  tenant?: accounts | null;
  tenant_user?: users;
  tenant_api?: {
    id: string;
    name: string;
    scope: any;
  };
};

export type AuthedRequestWithTenantAndBody<Body> = AuthedRequestWithBody<Body> &
  AuthedRequestWithTenant<Body>;

export type LoggedUser = {
  email: string;
  id: string;
  callbackUrl?: string;
  state?: string;
  displayName?: string;
  profileImageUrl?: string;
  sso?: string;
};
