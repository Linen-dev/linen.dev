import Channel, { ChannelProps } from 'components/Pages/Channel';
import { GetServerSideProps } from 'next/types';
import { channelGetServerSideProps } from 'services/ssr/channels';
import { trackPageView } from 'utilities/ssr-metrics';

export default Channel;

export const getServerSideProps: GetServerSideProps<ChannelProps> = async (
  context
) => {
  console.time('channelGetServerSideProps');
  const track = trackPageView(context);
  const data = await channelGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  if ((data as any)?.props?.permissions?.auth?.id) {
    track.knownUser((data as any).props.permissions.auth.id);
  }
  console.timeLog('channelGetServerSideProps');
  await track.flush();
  console.timeEnd('channelGetServerSideProps');
  return data;
};
