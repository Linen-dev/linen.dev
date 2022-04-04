import { getThreadById } from '../../../../../services/threads';
import { GetServerSidePropsContext } from 'next';
import Thread from '../../../../../components/Pages/Thread/Thread';

export default Thread;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const threadId = context.params?.threadId as string;
  const thread = await getThreadById(threadId);
  return {
    props: { ...thread, isSubDomainRouting: true },
  };
}
