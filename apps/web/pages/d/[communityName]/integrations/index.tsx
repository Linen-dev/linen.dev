import { GetServerSidePropsContext } from 'next';
import Integrations from 'components/Pages/Integrations';
import { getSettingsServerSideProps } from 'services/settings';

export default Integrations;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getSettingsServerSideProps(context, false);
}
