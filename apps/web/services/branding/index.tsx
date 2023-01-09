import { GetServerSidePropsContext } from 'next';
import serializeSettings from 'serializers/account/settings';
import ChannelsService from 'services/channels';
import CommunityService from 'services/community';
import Session from 'services/session';
import PermissionsService from 'services/permissions';
import { NotFound, RedirectTo } from 'utilities/response';
import serializeAccount from 'serializers/account';
import serializeChannel from 'serializers/channel';
import { qs } from 'utilities/url';

export async function getBrandingServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const community = await CommunityService.find(context.params);
  if (!community) {
    return NotFound();
  }

  const permissions = await PermissionsService.for(context);
  if (!permissions.access || !permissions.manage) {
    return RedirectTo(
      `/signin?${qs({
        ...(permissions.auth?.id && { error: 'private' }),
        callbackUrl: context.req.url,
      })}`
    );
  }

  const channels = await ChannelsService.find(community.id);
  const settings = serializeSettings(community);

  const token = await Session.tokenRaw(context.req);

  return {
    props: {
      token: token || null,
      currentCommunity: serializeAccount(community),
      channels: channels.map(serializeChannel),
      permissions,
      settings,
      isSubDomainRouting,
    },
  };
}
