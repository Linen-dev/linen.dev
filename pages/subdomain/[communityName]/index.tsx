import { GetServerSidePropsContext } from 'next';
import { getThreadsByCommunityName } from '../../../services/communities';
import Channel from '../../../components/Pages/Channels/Channel';

export default Channel;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const communityName = context.params?.communityName as string;
  const query = context.query;
  const page = Number(query.page) || 1;
  const result = await getThreadsByCommunityName(communityName, page);
  return { props: { ...result, isSubDomainRouting: true } };
}
