import type { GetServerSideProps } from 'next/types';
import Branding, { Props } from 'components/Pages/Branding';
import { getBrandingServerSideProps } from 'services/ssr/branding';
import { trackPage } from 'utilities/ssr-metrics';

export default Branding;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getBrandingServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  return trackPage<Props>(context, data);
};
