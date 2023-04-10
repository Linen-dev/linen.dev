import { GetServerSideProps } from 'next';
import { ssrGetServerSideProps } from 'services/ssr/starred';
import Starred, { Props } from 'components/Pages/Starred';
import { trackPageView } from 'utilities/ssr-metrics';

export default Starred;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const track = trackPageView(context);
  const data = await ssrGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  if ((data as any)?.props?.permissions?.auth?.id) {
    track.knownUser((data as any).props.permissions.auth.id);
  }
  await track.flush();
  return data;
};
