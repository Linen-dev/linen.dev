import { channelGetStaticProps } from '../../../../../services/communities';
import {
  GetServerSidePropsContext,
} from 'next';
import Channel from '../../../../../components/Pages/Channels';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetStaticProps(context, false);
}

export default Channel;
