import type { GetServerSideProps } from 'next/types';
import { ssrGetServerSideProps } from 'services/ssr/starred';
import Starred, { Props } from 'components/Pages/Starred';
import { trackPage } from 'utilities/ssr-metrics';

export default Starred;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await ssrGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
