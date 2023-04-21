import { serializeSettings } from '@linen/serializers/settings';
import ChannelsService from 'services/channels';
import CommunityService from 'services/community';
import CommunitiesService from 'services/communities';
import PermissionsService from 'services/permissions';
import { qs } from '@linen/utilities/url';
import { GetServerSidePropsContext } from 'next';
import { Permissions } from '@linen/types';
import { serializeAccount } from '@linen/serializers/account';
import { serializeChannel } from '@linen/serializers/channel';
import { getDMs } from 'lib/channel';
import { cleanUpUrl } from '@linen/utilities/url';

type validatePermissionsResponse = {
  redirect: Boolean;
  error: string;
};

export async function ssr(
  context: GetServerSidePropsContext,
  validatePermissions: (permissions: Permissions) => validatePermissionsResponse
) {
  const community = await CommunityService.find(context.params);
  if (!community) {
    return { notFound: true };
  }

  const permissions = await PermissionsService.for(context);
  const isAllow = validatePermissions(permissions);
  if (isAllow.redirect) {
    const url = cleanUpUrl(context.req.url);
    return {
      redirect: true,
      location: `/signin?${qs({
        error: isAllow.error,
        callbackUrl: url,
      })}`,
    };
  }

  const channels = await ChannelsService.find(community.id);
  const privateChannels = !!permissions.user?.id
    ? await ChannelsService.findPrivates({
        accountId: community.id,
        userId: permissions.user.id,
      })
    : [];

  const settings = serializeSettings(community);
  const communities = await CommunitiesService.find(context.req, context.res);

  const currentCommunity = serializeAccount(community);

  const dms = !!permissions.user?.id
    ? await getDMs({
        accountId: currentCommunity.id,
        userId: permissions.user.id,
      })
    : [];

  return {
    props: {
      token: permissions.token,
      currentCommunity,
      channels: [...channels, ...privateChannels].map(serializeChannel),
      communities: communities.map(serializeAccount),
      permissions,
      settings,
      dms,
    },
  };
}

export function allowAccess(
  permissions: Permissions
): validatePermissionsResponse {
  return { redirect: !permissions.access, error: 'private' };
}

export function allowInbox(
  permissions: Permissions
): validatePermissionsResponse {
  if (!permissions.access) {
    return { redirect: true, error: 'private' };
  }
  return { redirect: !permissions.inbox, error: 'forbidden' };
}

export function allowManagers(
  permissions: Permissions
): validatePermissionsResponse {
  if (!permissions.access) {
    return { redirect: true, error: 'private' };
  }
  return { redirect: !permissions.manage, error: 'forbidden' };
}
