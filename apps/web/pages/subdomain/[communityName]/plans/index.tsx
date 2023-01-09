import { GetServerSidePropsContext } from 'next';
import Plans from 'components/Pages/Plans';
import { getPlansServerSideProps } from 'services/plans';

export default Plans;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getPlansServerSideProps(context, true);
}
