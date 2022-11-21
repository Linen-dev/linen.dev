import type { accounts, users } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export type ApiRequest = NextApiRequest & {
  params: any;
  login: any;
};

export type AuthedApiRequest = ApiRequest & {
  logOut: any;
  user: {
    id: string;
    email: string;
    users?: users[];
  };
};

export type TenantApiRequest = AuthedApiRequest & {
  tenant: accounts;
  tenant_user?: users;
};

export type ApiResponse = NextApiResponse;
