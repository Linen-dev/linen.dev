import { ThreadPage, Props } from 'components/Pages/ThreadPage';
import { GetServerSideProps } from 'next';
import { threadGetServerSideProps } from 'services/ssr/threads';
import { trackPageView } from 'utilities/ssr-metrics';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const track = trackPageView(context);
  const data = await threadGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  if ((data as any)?.props?.permissions?.auth?.id) {
    track.knownUser((data as any).props.permissions.auth.id);
  }
  await track.flush();
  return data;
};
