import { GetServerSidePropsContext } from 'next';
import Branding from 'components/Pages/Branding';
import { getBrandingServerSideProps } from 'services/branding';

export default Branding;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getBrandingServerSideProps(context, true);
}
