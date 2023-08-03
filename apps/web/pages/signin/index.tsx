import { createCSRFToken } from '@linen/auth/server';
import type { GetServerSideProps } from 'next/types';
import { trackPageView } from 'utilities/ssr-metrics';
import Auth from '@linen/ui/Auth';

export default Auth.SignIn;

export const getServerSideProps: GetServerSideProps = async (context) => {
  await trackPageView(context);
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
};
