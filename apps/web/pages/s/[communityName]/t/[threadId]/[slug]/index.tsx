import { ThreadPage } from 'components/Pages/ThreadPage';
import { ThreadByIdProp } from 'types/apiResponses/threads/[threadId]';
import { GetServerSideProps } from 'next';
import { threadGetServerSideProps } from 'services/threads-ssr';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<ThreadByIdProp> = async (
  context
) => {
  return threadGetServerSideProps(context, context.query.customDomain === '1');
};
