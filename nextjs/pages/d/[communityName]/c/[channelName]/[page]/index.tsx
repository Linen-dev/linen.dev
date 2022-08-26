import { channelGetServerSideProps } from 'services/channel';
import { GetServerSidePropsContext } from 'next/types';
import Channel from 'components/Pages/ChannelsPage';

export default Channel;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetServerSideProps(context, false);
}
