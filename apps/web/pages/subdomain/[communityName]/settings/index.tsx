import { GetServerSidePropsContext } from 'next';
import Settings from 'components/Pages/Settings';
import { getSettingsServerSideProps } from 'services/settings';

export default Settings;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return getSettingsServerSideProps(context, true);
}
