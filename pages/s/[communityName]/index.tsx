import { GetStaticPropsContext } from 'next';
import {
  channelGetStaticPaths,
  channelGetStaticProps,
} from '../../../services/communities';
import Channel from '../../../components/Pages/Channels/Channel';

export default Channel;

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context, false);
}

export async function getStaticPaths() {
  return await channelGetStaticPaths();
}
