import type { GetServerSideProps } from 'next/types';
import { ssrGetServerSideProps } from 'services/ssr/all';
import All, { Props } from 'components/Pages/All';
import { trackPageView } from 'utilities/ssr-metrics';

export default All;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await ssrGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  await trackPageView(context, (data as any)?.props?.permissions?.auth?.email);
  return data;
};
