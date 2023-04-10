import { GetServerSideProps } from 'next';
import { inboxGetServerSideProps } from 'services/ssr/inbox';
import Inbox, { Props } from 'components/Pages/Inbox';
import { trackPageView } from 'utilities/ssr-metrics';

export default Inbox;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const track = trackPageView(context);
  const data = await inboxGetServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  if ((data as any)?.props?.permissions?.auth?.id) {
    track.knownUser((data as any).props.permissions.auth.id);
  }
  await track.flush();
  return data;
};
