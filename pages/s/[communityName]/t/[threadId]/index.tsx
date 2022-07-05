import { GetStaticPropsContext } from 'next';
import { threadGetStaticProps } from '../../../../../services/threads';
import Thread from '../../../../../components/Pages/Thread/Thread';

export default Thread;

//Renders the same page as /threadId
export async function getServerSideProps(context: GetStaticPropsContext) {
  return threadGetStaticProps(context, false);
}
