import { GetStaticPropsContext } from 'next';
import { threadGetStaticProps } from '../../../../../services/threads';
import Thread from '../../../../../components/Pages/Thread/Thread';

export default Thread;

//Renders the same page as /threadId
export async function getStaticProps(context: GetStaticPropsContext) {
  return threadGetStaticProps(context);
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
