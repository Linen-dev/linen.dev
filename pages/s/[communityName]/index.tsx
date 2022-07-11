import {
  GetServerSidePropsContext,
} from 'next';
import {
  channelGetStaticProps,
} from '../../../services/communities';
import Channel from '../../../components/Pages/Channels';

export default Channel;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return channelGetStaticProps(context, false);
}
