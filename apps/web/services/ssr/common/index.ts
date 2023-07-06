import { serializeSettings } from '@linen/serializers/settings';
import ChannelsService, { getDMs } from 'services/channels';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import { qs } from '@linen/utilities/url';
import { GetServerSidePropsContext } from 'next';
import { Permissions, validatePermissionsResponse } from '@linen/types';
import { serializeAccount } from '@linen/serializers/account';
import { serializeChannel } from '@linen/serializers/channel';
import { cleanUpUrl } from '@linen/utilities/url';
import type { accounts } from '@linen/database';

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

  const {
    currentCommunity,
    privateChannels,
    communities,
    settings,
    dmChannels,
    joinedChannels,
    publicChannels,
  } = await fetchCommon(permissions, community);

  return {
    props: {
      token: permissions.token,
      currentCommunity,
      publicChannels: publicChannels.map(serializeChannel),
      channels: [...joinedChannels, ...privateChannels]
        .map(serializeChannel)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      communities: communities.map(serializeAccount),
      permissions,
      settings,
      dms: dmChannels.map(serializeChannel),
    },
  };
}

export async function fetchCommon(
  permissions: Permissions,
  community: accounts
) {
  const publicChannels = await ChannelsService.find(community.id);

  const joinedChannels = !!permissions.user?.id
    ? await ChannelsService.findJoined({
        accountId: community.id,
        userId: permissions.user.id,
      })
    : [];

  const privateChannels = !!permissions.user?.id
    ? await ChannelsService.findPrivates({
        accountId: community.id,
        userId: permissions.user.id,
      })
    : [];

  const settings = serializeSettings(community);
  const communities = !!permissions.auth?.id
    ? await CommunityService.findByAuthId(permissions.auth.id)
    : [];

  const currentCommunity = serializeAccount(community);

  const dmChannels = !!permissions.user?.id
    ? await getDMs({
        accountId: currentCommunity.id,
        userId: permissions.user.id,
      })
    : [];

  return {
    currentCommunity,
    publicChannels,
    joinedChannels,
    privateChannels,
    communities,
    settings,
    dmChannels,
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
