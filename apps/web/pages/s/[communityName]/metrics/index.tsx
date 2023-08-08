import type { GetServerSideProps } from 'next/types';
import Metrics, { Props } from 'components/Pages/Metrics';
import { getMetricsServerSideProps } from 'services/ssr/metrics';
import { trackPage } from 'utilities/ssr-metrics';

export default Metrics;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getMetricsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
