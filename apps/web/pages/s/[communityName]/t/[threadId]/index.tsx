import { ThreadProps } from '@linen/types';
import { ThreadPage } from 'components/Pages/ThreadPage';
import type { GetServerSideProps } from 'next/types';
import { threadGetServerSideProps } from 'services/ssr/threads';
import { trackPage } from 'utilities/ssr-metrics';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<ThreadProps> = async (
  context
) => {
  const data = await threadGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<ThreadProps>(context, data);
};
