import { GetServerSideProps } from 'next';
import { ssrGetServerSideProps } from 'services/ssr/all';
import All, { Props } from 'components/Pages/All';

export default All;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return ssrGetServerSideProps(context, context.query.customDomain === '1');
};
