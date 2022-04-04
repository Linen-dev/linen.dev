import { getThreadsByCommunityName } from '../../../../../services/communities';
import { GetServerSidePropsContext } from 'next';

import Channel from '../../../../../components/Pages/Channels/Channel';
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const query = context.query;
  const page = Number(query.page) || 1;

  const result = await getThreadsByCommunityName(
    communityName,
    page,
    channelName
  );
  return { props: { ...result, isSubDomainRouting: true } };
}
export default Channel;
