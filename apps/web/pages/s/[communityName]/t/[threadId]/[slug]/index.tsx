import { ThreadPage, Props } from 'components/Pages/ThreadPage';
import { GetServerSideProps } from 'next';
import { threadGetServerSideProps } from 'services/ssr/threads';
import { trackPageView } from 'utilities/ssr-metrics';

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  console.time('threadGetServerSideProps');
  const track = trackPageView(context);
  const data = await threadGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  if ((data as any)?.props?.permissions?.auth?.id) {
    track.knownUser((data as any).props.permissions.auth.id);
  }
  console.timeLog('threadGetServerSideProps');
  await track.flush();
  console.timeEnd('threadGetServerSideProps');
  return data;
};
