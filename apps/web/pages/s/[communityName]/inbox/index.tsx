import type { GetServerSideProps } from 'next/types';
import { inboxGetServerSideProps } from 'services/ssr/inbox';
import Inbox from 'components/Pages/Inbox';
import { trackPage } from 'utilities/ssr-metrics';
import { InboxProps } from '@linen/types';

export default Inbox;

export const getServerSideProps: GetServerSideProps<InboxProps> = async (
  context
) => {
  const data = await inboxGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<InboxProps>(context, data);
};
