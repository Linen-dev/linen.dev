import { GetServerSidePropsContext } from 'next/types';
import { NotFound } from 'utilities/response';
import { findThreadsByCursor, findPinnedThreads } from 'lib/threads';
import serializeThread from 'serializers/thread';
import { SerializedChannel } from '@linen/types';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import { RedirectTo } from 'utilities/response';
import {
  redirectChannelToDomain,
  resolveCrawlerRedirect,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { z } from 'zod';
import { ssr, allowAccess } from 'services/ssr/common';
import { PAGE_SIZE } from 'secrets';

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

  const schema = z.object({
    communityName: z.string(),
    channelName: z.string().optional(),
    page: z.coerce.number().optional(),
  });

  const { channelName, communityName, page } = schema.parse(context.params);

  const channel = findChannelOrDefault([...channels, ...dms], channelName);
  if (!channel) return NotFound();

  if (isCrawler) {
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
        channel,
      });
    }

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
    if (!!page && !isPageValid(page, channel.pages)) {
      // should be redirect to first page
      return resolveCrawlerRedirect({
        isSubdomainbasedRouting,
        communityName,
        settings,
        channel,
      });
    }
  }

  let pageCursor = page || null;

  const threads = await findThreadsByCursor({
    channelIds: [channel.id],
    page: pageCursor,
    anonymizeUsers: currentCommunity.anonymizeUsers || false,
  });

  if (!isCrawler && threads.length < PAGE_SIZE && channel.pages) {
    const more = await findThreadsByCursor({
      channelIds: [channel.id],
      page: channel.pages,
      anonymizeUsers: currentCommunity.anonymizeUsers || false,
    });
    threads.unshift(...more);
    pageCursor = channel.pages;
  }

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
      currentChannel: channel,
      channelName: channel.channelName,
      threads: threads.map(serializeThread),
      pinnedThreads: pinnedThreads.map(serializeThread),
      isSubDomainRouting: isSubdomainbasedRouting,
      page: pageCursor,
      isBot: isCrawler,
    },
  };
}

function findChannelOrDefault(
  channels: SerializedChannel[],
  channelName?: string
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

function isPageValid(page: number, pages: number | null) {
  if (!pages) return false;
  if (!page) return false;

  const validation = z.coerce.number().positive().lte(pages);
  const result = validation.safeParse(page);
  return result.success;
}
