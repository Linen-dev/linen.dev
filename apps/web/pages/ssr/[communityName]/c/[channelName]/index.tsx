import { ChannelProps } from '@linen/types';
import Channel from 'components/Pages/Channel';
import { GetServerSideProps } from 'next/types';
import { channelGetServerSideProps } from 'services/ssr/channels';

export default Channel;

export const getServerSideProps: GetServerSideProps<ChannelProps> = async (
  context
) => {
  return await channelGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};

export const config = {
  unstable_runtimeJS: false,
};
