import { getThreadsByCommunityName } from '../../../../../services/communities';
import { GetServerSidePropsContext } from 'next';

import Channel from '../../index';
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const query = context.query;
  const page = Number(query.page) || 1;
  const host = context.req.headers.host || '';

  return await getThreadsByCommunityName(
    communityName,
    page,
    host,
    channelName
  );
}
export default Channel;
