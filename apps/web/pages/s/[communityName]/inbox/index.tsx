import type { GetServerSideProps } from 'next/types';
import { inboxGetServerSideProps } from 'services/ssr/inbox';
import Inbox from 'components/Pages/Inbox';
import { trackPageView } from 'utilities/ssr-metrics';
import { InboxProps } from '@linen/types';

export default Inbox;

export const getServerSideProps: GetServerSideProps<InboxProps> = async (
  context
) => {
  const data = await inboxGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  await trackPageView(context, (data as any)?.props?.permissions?.auth?.email);
  return data;
};
