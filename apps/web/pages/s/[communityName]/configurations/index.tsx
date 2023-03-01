import { GetServerSideProps } from 'next';
import Configurations, { Props } from 'components/Pages/Configurations';
import { getSettingsServerSideProps } from 'services/settings';

export default Configurations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getSettingsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
