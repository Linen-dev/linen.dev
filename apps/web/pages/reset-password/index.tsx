import { NextPageContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';
import Auth from '@linen/ui/Auth';

export default Auth.ResetPassword;

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {
      token: context.query.token,
    },
  };
}
