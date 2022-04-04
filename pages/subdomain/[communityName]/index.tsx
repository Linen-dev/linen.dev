import { GetStaticPropsContext } from 'next';
import { channelGetStaticProps } from '../../../services/communities';
import Channel from '../../../components/Pages/Channels/Channel';

export default Channel;

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context, true);
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
