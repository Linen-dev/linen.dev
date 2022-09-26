import { GetServerSidePropsContext } from 'next';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import ChannelsService from 'services/channels';
import { serialize as serializeSettings } from 'serializers/account/settings';
import { NotFound, RedirectTo } from 'utilities/response';
import { isFeedEnabled } from 'utilities/featureFlags';
import Session from 'services/session';
import { findAuthByEmail } from 'lib/users';
import serializeUser from 'serializers/user';

export async function feedGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const permissions = await PermissionsService.for(context);
  if (!permissions.feed || !isFeedEnabled) {
    return RedirectTo('/signin');
  }
  const community = await CommunityService.find(context.params);
  if (!community) {
    return NotFound();
  }
  const channels = await ChannelsService.find(community.id);

  let currentUser;
  const session = await Session.find(context.req, context.res);
  if (session && session.user && session.user.email) {
    const auth = await findAuthByEmail(session.user.email);
    if (auth) {
      currentUser = auth.users.find(
        (user) => user.accountsId === auth.accountId
      );
    }
  }

  return {
    props: {
      communityName: context?.params?.communityName,
      isSubDomainRouting,
      settings: serializeSettings(community),
      currentUser: currentUser && serializeUser(currentUser),
      channels,
      permissions,
    },
  };
}
