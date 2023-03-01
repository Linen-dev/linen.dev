import Channel, { ChannelProps } from 'components/Pages/Channel';
import { GetServerSideProps } from 'next/types';
import { channelGetServerSideProps } from 'services/channel';

export default Channel;

export const getServerSideProps: GetServerSideProps<ChannelProps> = async (
  context
) => {
  return channelGetServerSideProps(context, context.query.customDomain === '1');
};
