import {
  GetServerSidePropsContext,
} from 'next/types';
import Channel from '../../../../../components/Pages/Channels';
import { channelGetStaticProps } from '../../../../../services/communities';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetStaticProps(context, true);
}

export default Channel;
