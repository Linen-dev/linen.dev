import { getThreadById } from '../../../../../services/threads';
import { GetServerSidePropsContext } from 'next';
import { isSubdomainbasedRouting } from '../../../../../lib/util';
import Thread from '../../../../../components/Pages/Thread/Thread';

export default Thread;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const threadId = context.params?.threadId as string;
  const host = context.req.headers.host || '';
  const isSubDomainRouting = isSubdomainbasedRouting(host);
  const thread = await getThreadById(threadId, host);
  return {
    props: { ...thread, isSubDomainRouting },
  };
}
