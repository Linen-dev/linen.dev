import { createCSRFToken } from '@linen/auth/server';
import type { NextPageContext } from 'next';
import Auth from '@linen/ui/Auth';
import { trackPageView } from 'utilities/ssr-metrics';

export default Auth.SignUp;

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {
      csrfToken: createCSRFToken(),
      error: context.query.error || null,
      callbackUrl: context.query.callbackUrl || '/api/router',
      email: context.query.email || '',
      state: context.query.state || null,
      mode: context.query.mode || 'magic',
      sso: context.query.sso || null,
    },
  };
}
