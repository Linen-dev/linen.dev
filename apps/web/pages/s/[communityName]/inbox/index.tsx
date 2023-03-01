import { GetServerSideProps } from 'next';
import { inboxGetServerSideProps } from 'services/ssr/inbox';
import Inbox, { Props } from 'components/Pages/Inbox';

export default Inbox;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return inboxGetServerSideProps(context, context.query.customDomain === '1');
};
