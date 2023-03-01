import { GetServerSideProps } from 'next';
import Integrations, { Props } from 'components/Pages/Integrations';
import { getSettingsServerSideProps } from 'services/settings';

export default Integrations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getSettingsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
