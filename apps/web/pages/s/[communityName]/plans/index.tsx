import { GetServerSideProps } from 'next';
import Plans, { Props } from 'components/Pages/Plans';
import { getPlansServerSideProps } from 'services/plans';

export default Plans;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getPlansServerSideProps(context, context.query.customDomain === '1');
};
