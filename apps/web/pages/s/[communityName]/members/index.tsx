import { GetServerSidePropsContext } from 'next';
import Members from 'components/Pages/Members';
import { getMembersServerSideProps } from 'services/members';

export default Members;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getMembersServerSideProps(context, context.query.customDomain === '1');
}
