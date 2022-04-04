import { GetStaticPropsContext } from 'next/types';
import Channel from '../../../../../components/Pages/Channels/Channel';
import { channelGetStaticProps } from '../../../../../services/communities';

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
