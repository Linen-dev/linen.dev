import type { GetServerSideProps } from 'next/types';
import { trackPageView } from 'utilities/ssr-metrics';
import Auth from '@linen/ui/Auth';

export default Auth.ResetPassword;

export const getServerSideProps: GetServerSideProps = async (context) => {
  await trackPageView(context);
  return {
    props: {
      token: context.query.token,
    },
  };
};
