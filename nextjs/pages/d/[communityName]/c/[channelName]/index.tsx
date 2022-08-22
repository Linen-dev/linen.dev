import { channelGetServerSideProps } from 'services/channel';
import Channel from 'components/Pages/Channels';
import { GetServerSidePropsContext } from 'next/types';

export default Channel;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetServerSideProps(context, false);
}
