import { GetServerSideProps } from 'next';
import Configurations, { Props } from 'components/Pages/Channels';
import { getConfigurationsServerSideProps } from 'services/ssr/configurations';

export default Configurations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getConfigurationsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
