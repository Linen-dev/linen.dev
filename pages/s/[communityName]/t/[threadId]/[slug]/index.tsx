import { GetServerSidePropsContext } from 'next';
import { getThreadById } from '../../../../../../services/threads';
import Thread from '../index';

export default Thread;

//Renders the same page as /threadId
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const threadId = context.params?.threadId as string;
  const host = context.req.headers.host || '';
  return await getThreadById(threadId, host);
}
