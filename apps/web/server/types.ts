import type { accounts, users } from '@prisma/client';
import * as express from 'express';

export type Response = express.Response;
export type Request = express.Request;
export type NextFunction = express.NextFunction;

export type AuthedRequest<
  Params = any,
  ResBody = any,
  Body = any,
  Query = any
> = express.Request<Params, ResBody, Body, Query> & {
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
};
