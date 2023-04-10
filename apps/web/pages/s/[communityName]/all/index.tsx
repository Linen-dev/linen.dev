import { GetServerSideProps } from 'next';
import { ssrGetServerSideProps } from 'services/ssr/all';
import All, { Props } from 'components/Pages/All';
import { trackPageView } from 'utilities/ssr-metrics';

export default All;

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
