import { GetServerSidePropsContext } from 'next';
import serializeSettings from 'serializers/account/settings';
import ChannelsService from 'services/channels';
import CommunityService from 'services/community';
import Session from 'services/session';
import PermissionsService from 'services/permissions';
import { NotFound, RedirectTo } from 'utilities/response';

export async function getMetricsServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const community = await CommunityService.find(context.params);
  if (!community) {
    return NotFound();
  }

  const permissions = await PermissionsService.for(context);
  if (!permissions.access || !permissions.manage) {
    return RedirectTo('/signin');
  }

  const channels = await ChannelsService.find(community.id);
  const settings = serializeSettings(community);

  const token = await Session.tokenRaw(context.req);

  return {
    props: {
      token: token || null,
      channels,
      permissions,
      settings,
      isSubDomainRouting,
    },
  };
}
