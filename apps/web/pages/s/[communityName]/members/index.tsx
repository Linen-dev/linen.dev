import { GetServerSideProps } from 'next';
import Members, { Props } from 'components/Pages/Members';
import { getMembersServerSideProps } from 'services/ssr/members';

export default Members;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getMembersServerSideProps(context, context.query.customDomain === '1');
};
