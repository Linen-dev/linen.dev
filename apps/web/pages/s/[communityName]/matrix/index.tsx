import { GetServerSideProps } from 'next';
import MatrixPage, { Props } from 'components/Pages/Matrix';
import { getConfigurationsServerSideProps } from 'services/ssr/configurations';

export default MatrixPage;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getConfigurationsServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
