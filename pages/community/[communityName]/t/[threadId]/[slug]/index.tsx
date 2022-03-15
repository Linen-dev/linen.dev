import { getThread } from '../../../../../../lib/getThread';
import Thread from '../index';

export default Thread;

//Renders the same page as /threadId
export async function getServerSideProps({
  params: { threadId },
}: {
  params: { threadId: string };
}) {
  return await getThread(threadId);
}
