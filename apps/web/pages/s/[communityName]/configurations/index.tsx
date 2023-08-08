import type { GetServerSideProps } from 'next/types';
import Configurations, { Props } from 'components/Pages/Configurations';
import { getConfigurationsServerSideProps } from 'services/ssr/configurations';
import { trackPage } from 'utilities/ssr-metrics';

export default Configurations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getConfigurationsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
