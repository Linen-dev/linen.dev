import Channel from 'components/Pages/Channel';
import { GetServerSidePropsContext } from 'next/types';
import { channelGetServerSideProps } from 'services/channel';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetServerSideProps(context, false);
}
export default Channel;
