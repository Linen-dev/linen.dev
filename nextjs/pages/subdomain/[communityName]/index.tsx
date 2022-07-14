import { GetStaticPropsContext } from 'next';
import {
  channelGetStaticPaths,
  channelGetStaticProps,
} from '../../../services/communities';
import Channel from '../../../components/Pages/Channels';

export default Channel;

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context);
}

export async function getStaticPaths() {
  return await channelGetStaticPaths('/subdomain');
}
