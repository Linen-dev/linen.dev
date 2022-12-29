import '__mocks__/tokens';
import { testApiHandler } from 'next-test-api-route-handler';
import handler from 'pages/api/auth/[[...slug]]';
import { createCSRFToken } from 'utilities/auth/server/csrf';

export async function login({ email, password }: any) {
  let body: any = '';
  let status = 0;

  let csrfToken = createCSRFToken();
  await testApiHandler({
    handler,
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

export function addTokenHeader(token: string) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}
