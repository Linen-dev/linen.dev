import type { GetServerSideProps } from 'next/types';
import Members, { Props } from 'components/Pages/Members';
import { getMembersServerSideProps } from 'services/ssr/members';
import { trackPageView } from 'utilities/ssr-metrics';

export default Members;

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const data = await getMembersServerSideProps(
    context,
    context.query.customDomain === '1'
  );
  await trackPageView(context, (data as any)?.props?.permissions?.auth?.email);
  return data;
};
