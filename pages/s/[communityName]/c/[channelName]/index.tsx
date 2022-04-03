import { getThreadsByCommunityName } from '../../../../../services/communities';
import { GetServerSidePropsContext } from 'next';

import Channel from '../../../../../components/Pages/Channels/Channel';
import { isSubdomainbasedRouting } from '../../../../../lib/util';
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const query = context.query;
  const page = Number(query.page) || 1;
  const host = context.req.headers.host || '';
  const isSubDomainRouting = isSubdomainbasedRouting(host);

  const result = await getThreadsByCommunityName(
    communityName,
    page,
    channelName
  );
  return { props: { ...result, isSubDomainRouting } };
}
export default Channel;
