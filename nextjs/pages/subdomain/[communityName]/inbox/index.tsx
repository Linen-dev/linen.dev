import { GetServerSidePropsContext } from 'next';
import { inboxGetServerSideProps } from 'services/inbox';

import Inbox from 'components/Pages/Inbox';

export default Inbox;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return inboxGetServerSideProps(context, true);
}
