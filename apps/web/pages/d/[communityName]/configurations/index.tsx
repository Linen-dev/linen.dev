import { GetServerSidePropsContext } from 'next';
import Configurations from 'components/Pages/Configurations';
import { getSettingsServerSideProps } from 'services/settings';

export default Configurations;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getSettingsServerSideProps(context, false);
}
