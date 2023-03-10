import { GetServerSideProps } from 'next';
import { inboxGetServerSideProps } from 'services/ssr/inbox';
import Starred, { Props } from 'components/Pages/Starred';

export default Starred;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return inboxGetServerSideProps(context, context.query.customDomain === '1');
};
