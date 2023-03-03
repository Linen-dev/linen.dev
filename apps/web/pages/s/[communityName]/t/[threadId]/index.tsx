import { ThreadPage, Props } from 'components/Pages/ThreadPage';
import { GetServerSideProps } from 'next';
import { threadGetServerSideProps } from 'services/ssr/threads';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return threadGetServerSideProps(context, context.query.customDomain === '1');
};
