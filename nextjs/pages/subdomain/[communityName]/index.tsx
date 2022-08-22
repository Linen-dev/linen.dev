import Channel from 'components/Pages/Channels';
import { GetServerSidePropsContext } from 'next/types';
import { channelGetServerSideProps } from 'services/channel';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetServerSideProps(context, true);
}
export default Channel;
