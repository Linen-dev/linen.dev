import { Router } from 'express';
import { z } from 'zod';
import {
  AuthedRequestWithBody,
  Response,
  apiGetChannelProps,
  AnonymizeType,
} from '@linen/types';
import { serializeThread } from '@linen/serializers/thread';
import { sortBySentAtAsc } from '@linen/utilities/object';
import validationMiddleware from 'server/middlewares/validation';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import { findThreadsByCursor, findPinnedThreads } from 'services/threads';
import { decodeCursor } from 'utilities/cursor';
import { buildCursor } from 'utilities/buildCursor';
import { fetchCommon } from 'services/ssr/common';
import { findChannelOrGetLandingChannel } from 'utilities/findChannelOrGetLandingChannel';

const prefix = '/api/ssr/channels';
const ssrRouter = Router();

const getSchema = z.object({
  communityName: z.string(),
  channelName: z.string().optional(),
  page: z.string().optional(),
});

ssrRouter.get(
  `${prefix}`,
  validationMiddleware(getSchema, 'query'),
  async (
    req: AuthedRequestWithBody<z.infer<typeof getSchema>>,
    res: Response
  ) => {
    const { communityName, channelName, page } = req.body;

    const community = await CommunityService.find({ communityName });
    if (!community) {
      res.status(404);
      return res.end();
    }

    const permissions = await PermissionsService.get({
      params: { communityName },
      request: req,
      response: res,
    });

    if (!permissions.access) {
      res.status(403);
      return res.end();
    }

    const {
      currentCommunity,
      privateChannels,
      dmChannels,
      joinedChannels,
      publicChannels,
    } = await fetchCommon(permissions, community);

    const currentChannel = findChannelOrGetLandingChannel(
      [...joinedChannels, ...dmChannels, ...privateChannels, ...publicChannels],
      channelName
    );
    if (!currentChannel) {
      res.status(404);
      return res.end();
    }

    const { nextCursor, threads } = await getThreads({
      channelId: currentChannel.id,
      anonymize: currentCommunity.anonymize,
      anonymizeUsers: currentCommunity.anonymizeUsers || false,
      page,
    });

    const pinnedThreads = await findPinnedThreads({
      channelIds: [currentChannel.id],
      anonymize: currentCommunity.anonymize,
      anonymizeUsers: currentCommunity.anonymizeUsers,
      limit: 10,
    });

    const props: apiGetChannelProps = {
      nextCursor,
      currentChannel,
      channelName: currentChannel.channelName,
      threads: threads.map(serializeThread),
      pinnedThreads: pinnedThreads.map(serializeThread),
      pathCursor: page || null,
    };
    res.json(props);
    res.end();
  }
);

async function getThreads({
  channelId,
  anonymizeUsers,
  anonymize,
  page,
}: {
  channelId: string;
  anonymizeUsers: boolean;
  anonymize: AnonymizeType;
  page?: string;
}) {
  if (!!page) {
    const threads = (
      await findThreadsByCursor({
        channelIds: [channelId],
        page: parsePage(page),
        anonymize,
        anonymizeUsers,
      })
    ).sort(sortBySentAtAsc);

    return {
      nextCursor: {
        next: null,
        prev: null,
      },
      threads,
    };
  }

  const { sort, direction, sentAt } = decodeCursor(undefined);

  const threads = (
    await findThreadsByCursor({
      channelIds: [channelId],
      sentAt,
      sort,
      direction,
      anonymize,
      anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const nextCursor = await buildCursor({
    sort,
    direction,
    sentAt,
    pathCursor: page,
    total: threads.length,
    prevDate: threads[0].sentAt,
    nextDate: threads[threads.length - 1].sentAt,
  });
  return { nextCursor, threads };
}

function parsePage(page: string): number | undefined {
  try {
    return z.coerce.number().parse(page);
  } catch (error) {
    return undefined;
  }
}

export default ssrRouter;
