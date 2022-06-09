import { GetStaticPropsContext } from 'next';
import { getThreadById } from '../../../../../../services/threads';
import Thread from '../../../../../../components/Pages/Thread/Thread';
import * as Sentry from '@sentry/nextjs';

export default Thread;

//Renders the same page as /threadId
export async function getStaticProps(context: GetStaticPropsContext) {
  const threadId = context.params?.threadId as string;
  try {
    const thread = await getThreadById(threadId);
    return {
      props: { ...thread, isSubDomainRouting: false },
      revalidate: 60, // In seconds
    };
  } catch (exception) {
    Sentry.captureException(exception);

    return {
      notFound: true,
    };
  }
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
