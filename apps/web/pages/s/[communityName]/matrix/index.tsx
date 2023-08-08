import type { GetServerSideProps } from 'next/types';
import MatrixPage, { Props } from 'components/Pages/Matrix';
import { getConfigurationsServerSideProps } from 'services/ssr/configurations';
import { trackPage } from 'utilities/ssr-metrics';

export default MatrixPage;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getConfigurationsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
