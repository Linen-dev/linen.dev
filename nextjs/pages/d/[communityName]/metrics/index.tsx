import { GetServerSidePropsContext } from 'next';
import Metrics from 'components/Pages/Metrics';
import { getMetricsServerSideProps } from 'services/metrics';

export default Metrics;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getMetricsServerSideProps(context, false);
}
