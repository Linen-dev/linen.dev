import serializeSettings from 'serializers/account/settings';
import ChannelsService from 'services/channels';
import CommunityService from 'services/community';
import CommunitiesService from 'services/communities';
import Session from 'services/session';
import PermissionsService from 'services/permissions';
import { qs } from '@linen/utilities/url';
import { GetServerSidePropsContext } from 'next';
import { Permissions } from '@linen/types';
import serializeAccount from 'serializers/account';
import serializeChannel from 'serializers/channel';

export async function ssr(
  context: GetServerSidePropsContext,
  validatePermissions: (permissions: Permissions) => Boolean
) {
  const community = await CommunityService.find(context.params);
  if (!community) {
    return { notFound: true };
  }

  const permissions = await PermissionsService.for(context);
  if (validatePermissions(permissions)) {
    return {
      redirect: true,
      location: `/signin?${qs({
        ...(permissions.auth?.id && { error: 'private' }),
        callbackUrl: context.req.url,
      })}`,
    };
  }

  const channels = await ChannelsService.find(community.id);
  const settings = serializeSettings(community);
  const communities = await CommunitiesService.find(context.req, context.res);

  return {
    props: {
      token: permissions.token,
      currentCommunity: serializeAccount(community),
      channels: channels.map(serializeChannel),
      communities: communities.map(serializeAccount),
      permissions,
      settings,
    },
  };
}

export function allowAccess(permissions: Permissions) {
  return !permissions.access;
}

export function allowInbox(permissions: Permissions) {
  return !permissions.access || !permissions.inbox;
}

export function allowManagers(permissions: Permissions) {
  return !permissions.access || !permissions.manage;
}
