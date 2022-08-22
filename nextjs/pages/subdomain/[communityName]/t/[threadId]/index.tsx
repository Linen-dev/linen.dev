import { GetStaticPropsContext } from 'next';
import { threadGetStaticProps } from '../../../../../services/threads';
import ThreadPage from '../../../../../components/Pages/ThreadPage/ThreadPage';

export default ThreadPage;

//Renders the same page as /threadId
export async function getStaticProps(context: GetStaticPropsContext) {
  return threadGetStaticProps(context, true);
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
