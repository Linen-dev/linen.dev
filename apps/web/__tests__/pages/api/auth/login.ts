import '__mocks__/tokens';
import { testApiHandler } from 'next-test-api-route-handler';
import handlerLogin from 'pages/api/auth/callback/credentials';
import { createCSRFToken } from 'utilities/auth/server/csrf';

export async function login({ email, password }: any) {
  let body: any = '';
  let status = 0;

  let csrfToken = createCSRFToken();
  await testApiHandler({
    handler: handlerLogin,
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
