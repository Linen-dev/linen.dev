/**
 * @jest-environment node
 */

import { testApiHandler } from 'next-test-api-route-handler';
import handler from 'pages/api/auth/[[...slug]]';
import { createCSRFToken } from '@linen/auth/server';

export async function login({ email, password }: any) {
  let body: any = '';
  let status = 0;

  let csrfToken = createCSRFToken();
  await testApiHandler({
    handler: handler as any,
    url: '/api/auth/callback/credentials',
    test: async ({ fetch }: any) => {
      const response = await fetch({
        method: 'POST',
        body: JSON.stringify({ username: email, password, csrfToken }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      status = response.status;
      body = await response.json();
    },
  });
  return { body, status };
}

export function attachHeaders({
  token,
  apiKey,
}: { token?: string; apiKey?: string } = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(!!token && { Authorization: `Bearer ${token}` }),
      ...(!!apiKey && { 'X-Api-Key': apiKey }),
    },
  };
}
