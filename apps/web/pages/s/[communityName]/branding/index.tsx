import { GetServerSideProps } from 'next';
import Branding, { Props } from 'components/Pages/Branding';
import { getBrandingServerSideProps } from 'services/branding';

export default Branding;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  return getBrandingServerSideProps(
    context,
    context.query.customDomain === '1'
  );
};
