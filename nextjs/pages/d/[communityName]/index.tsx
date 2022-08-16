import { GetStaticPropsContext } from 'next';
import {
  channelGetStaticPaths,
  channelGetStaticProps,
} from '../../../services/channel';
import Channel from '../../../components/Pages/Channels';

export default Channel;

export async function getStaticProps(context: GetStaticPropsContext) {
  return channelGetStaticProps(context, false);
}

export async function getStaticPaths() {
  return await channelGetStaticPaths('/d');
}
