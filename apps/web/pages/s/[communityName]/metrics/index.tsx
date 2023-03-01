import { GetServerSideProps } from 'next';
import Metrics, { Props } from 'components/Pages/Metrics';
import { getMetricsServerSideProps } from 'services/metrics';

export default Metrics;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getMetricsServerSideProps(context, context.query.customDomain === '1');
};
