import { GetServerSideProps } from 'next';
import Integrations, { Props } from 'components/Pages/Integrations';
import { getIntegrationsServerSideProps } from 'services/ssr/integrations';

export default Integrations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getIntegrationsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
