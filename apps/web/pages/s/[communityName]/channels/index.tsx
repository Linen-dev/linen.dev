import type { GetServerSideProps } from 'next/types';
import Configurations, { Props } from 'components/Pages/Channels';
import { getChannelsSettingsServerSideProps } from 'services/ssr/channels';
import { trackPage } from 'utilities/ssr-metrics';

export default Configurations;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getChannelsSettingsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
