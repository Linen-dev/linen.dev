import { GetServerSidePropsContext } from 'next';
import { feedGetServerSideProps } from 'services/feed';

import Feed from 'components/Pages/Feed';

export default Feed;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return feedGetServerSideProps(context, false);
}
