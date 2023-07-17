import { ThreadProps } from '@linen/types';
import { ThreadPage } from 'components/Pages/ThreadPage';
import { GetServerSideProps } from 'next';
import { threadGetServerSideProps } from 'services/ssr/threads';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<ThreadProps> = async (
  context
) => {
  return await threadGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};

export const config = {
  unstable_runtimeJS: false,
};
