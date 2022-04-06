import { channelGetStaticProps } from '../../../../../../services/communities';
import { GetStaticPropsContext } from 'next';
import Channel from '../../../../../../components/Pages/Channels/Channel';

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context, true);
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export default Channel;
