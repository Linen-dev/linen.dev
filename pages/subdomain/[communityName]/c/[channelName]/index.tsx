import { GetStaticPropsContext } from 'next/types';
import Channel from '../../../../../components/Pages/Channels';
import { channelGetStaticProps } from '../../../../../services/communities';

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context, true);
}

export function getStaticPaths() {
  return {
    paths: [],
    // fallback: true,
    fallback: 'blocking',
  };
}

export default Channel;
