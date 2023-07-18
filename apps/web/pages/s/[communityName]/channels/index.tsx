import { GetServerSideProps } from 'next';
import Configurations, { Props } from 'components/Pages/Channels';
import { getChannelsSettingsServerSideProps } from 'services/ssr/channels';

export default Configurations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getChannelsSettingsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
