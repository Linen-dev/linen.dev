import { createCSRFToken } from 'utilities/auth/server/csrf';
import type { NextPageContext } from 'next';
import SignUp from 'components/Pages/SignUp';
import { trackPageView } from 'utilities/ssr-metrics';

export default SignUp;

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
    },
  };
}
