import { GetServerSidePropsContext } from 'next/types';
import { NotFound } from 'utilities/response';
import { findPinnedThreads } from 'services/threads';
import { serializeThread } from '@linen/serializers/thread';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import { RedirectTo } from 'utilities/response';
import {
  redirectChannelToDomain,
  resolveCrawlerRedirect,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { ssr, allowAccess } from 'services/ssr/common';
import { findTopics } from 'services/threads/topics';
import { findChannelOrGetLandingChannel } from 'utilities/findChannelOrGetLandingChannel';
import { decodeCursor } from 'utilities/cursor';
import { buildCursor } from 'utilities/buildCursor';

export async function topicGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  const isCrawler = isBot(context?.req?.headers?.['user-agent'] || '');

  const { props, notFound, ...rest } = await ssr(
    context,
    allowAccess,
    isCrawler
  );

  if (rest.redirect) {
    return RedirectTo(rest.location);
  }

  if (notFound || !props) {
    return NotFound();
  }

  const { channels, currentCommunity, settings, dms, publicChannels } = props;

  const communityName = context.params?.communityName as string;
  const channelName = context.params?.channelName as string;
  const page = context.params?.page as string | undefined;

  const channel = findChannelOrGetLandingChannel(
    [...channels, ...dms, ...publicChannels],
    channelName
  );
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
  }

  const { threads, topics } = await findTopics({
    channelId: channel.id,
    anonymize: currentCommunity.anonymize,
    accountId: currentCommunity.id,
  });

  const pinnedThreads = !isCrawler
    ? await findPinnedThreads({
        channelIds: [channel.id],
        anonymize: currentCommunity.anonymize,
        anonymizeUsers: currentCommunity.anonymizeUsers,
        limit: 10,
      })
    : [];

  // const nextCursor = {
  //   next: null,
  //   prev: null,
  // };
  const { sort, direction, sentAt } = decodeCursor(undefined);

  const nextCursor = await buildCursor({
    sort,
    direction,
    sentAt,
    pathCursor: page,
    total: topics.length,
    prevDate: topics[0].sentAt,
    nextDate: topics[topics.length - 1].sentAt,
  });

  return {
    props: {
      ...props,
      nextCursor,
      topics,
      threads,
      currentChannel: channel,
      channelName: channel.channelName,
      pinnedThreads: pinnedThreads.map(serializeThread),
      isSubDomainRouting: isSubdomainbasedRouting,
    },
  };
}
