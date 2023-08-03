import type { GetServerSideProps } from 'next/types';
import Plans, { Props } from 'components/Pages/Plans';
import { getPlansServerSideProps } from 'services/ssr/plans';
import { trackPageView } from 'utilities/ssr-metrics';

export default Plans;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getPlansServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  await trackPageView(context, (data as any)?.props?.permissions?.auth?.email);
  return data;
};
