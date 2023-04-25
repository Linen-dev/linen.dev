import { GetServerSidePropsContext } from 'next/types';
import { NotFound } from 'utilities/response';
import { findThreadsByCursor, findPinnedThreads } from 'services/threads';
import { serializeThread } from '@linen/serializers/thread';
import { decodeCursor } from 'utilities/cursor';
import { SerializedChannel } from '@linen/types';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import { RedirectTo } from 'utilities/response';
import {
  redirectChannelToDomain,
  resolveCrawlerRedirect,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { z } from 'zod';
import { buildCursor } from 'utilities/buildCursor';
import { sortBySentAtAsc } from '@linen/utilities/object';
import { ssr, allowAccess } from 'services/ssr/common';

export async function channelGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  const { props, notFound, ...rest } = await ssr(context, allowAccess);

  if (rest.redirect) {
    return RedirectTo(rest.location);
  }

  if (notFound || !props) {
    return NotFound();
  }

  const { channels, currentCommunity, settings, dms } = props;

  const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');
  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string | undefined;

  const channel = findChannelOrDefault([...channels, ...dms], channelName);
  if (!channel) return NotFound();

  if (
    shouldRedirectToDomain({
      account: currentCommunity,
      communityName,
      isSubdomainbasedRouting,
    })
  ) {
    return redirectChannelToDomain({
      account: currentCommunity,
      communityName,
      settings,
      channelName,
      channel,
    });
  }

  if (isCrawler) {
    if (!channelName) {
      // should be redirect to default_channel
      return resolveCrawlerRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
    // if page exists, it must be a number between 1 and channel's pages field
    // otherwise redirect to latest (no-page)
    if (!!page && isPageNotValid(page, channel.pages)) {
      // should be redirect to first page
      return resolveCrawlerRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
  }

  const { nextCursor, threads } = await getThreads({
    channelId: channel.id,
    anonymizeUsers: currentCommunity.anonymizeUsers || false,
    page,
  });

  const pinnedThreads = !isCrawler
    ? await findPinnedThreads({
        channelIds: [channel.id],
        anonymizeUsers: currentCommunity.anonymizeUsers,
        limit: 10,
      })
    : [];

  return {
    props: {
      ...props,
      nextCursor,
      currentChannel: channel,
      channelName: channel.channelName,
      threads: threads.map(serializeThread),
      pinnedThreads: pinnedThreads.map(serializeThread),
      isSubDomainRouting: isSubdomainbasedRouting,
      pathCursor: page || null,
      isBot: isCrawler,
    },
  };
}

async function getThreads({
  channelId,
  anonymizeUsers,
  page,
}: {
  channelId: string;
  anonymizeUsers: boolean;
  page?: string;
}) {
  if (!!page) {
    const threads = (
      await findThreadsByCursor({
        channelIds: [channelId],
        page: parsePage(page),
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
      anonymizeUsers,
    })
  ).sort(sortBySentAtAsc);

  const nextCursor = await buildCursor({
    sort,
    direction,
    sentAt,
    threads,
    pathCursor: page,
  });
  return { nextCursor, threads };
}

function findChannelOrDefault(
  channels: SerializedChannel[],
  channelName: string
) {
  if (channelName) {
    return channels.find(
      (c) => c.channelName === channelName || c.id === channelName
    );
  }
  const defaultChannel = channels.find((c) => c.default);
  if (defaultChannel) return defaultChannel;

  return channels[0];
}

function isPageNotValid(page: string, pages: number | null) {
  return !isPageValid(page, pages);
}

function isPageValid(page: string, pages: number | null) {
  if (!pages) return false;
  if (!page) return false;

  const validation = z.coerce.number().positive().lte(pages);
  const result = validation.safeParse(page);
  return result.success;
}

function parsePage(page: string): number | undefined {
  try {
    return z.coerce.number().parse(page);
  } catch (error) {
    return undefined;
  }
}
