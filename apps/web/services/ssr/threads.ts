import { serializeThread } from '@linen/serializers/thread';
import { findThreadByIncrementId } from 'services/threads';
import { GetServerSidePropsContext } from 'next';
import { NotFound } from 'utilities/response';
import { RedirectTo } from 'utilities/response';
import { isBot } from 'next/dist/server/web/spec-extension/user-agent';
import {
  redirectThreadToDomain,
  shouldRedirectToDomain,
} from 'utilities/redirects';
import { allowAccess, ssr } from 'services/ssr/common';

export async function threadGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubdomainbasedRouting: boolean
) {
  try {
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

    const { channels, currentCommunity, dms, settings, publicChannels } = props;

    const threadId = context.params?.threadId as string;
    const communityName = context.params?.communityName as string;
    const slug = context.params?.slug as string | undefined;

    const id = parseInt(threadId);
    if (!id) {
      throw new Error('Thread not found');
    }

    const thread = await findThreadByIncrementId(id);

    if (!thread || !thread?.channel?.accountId) {
      throw new Error('Thread not found');
    }

    if (thread?.channel?.accountId !== currentCommunity.id) {
      throw new Error('Thread not found');
    }

    if (
      shouldRedirectToDomain({
        account: currentCommunity,
        communityName,
        isSubdomainbasedRouting,
      })
    ) {
      return redirectThreadToDomain({
        account: currentCommunity,
        communityName,
        settings,
        threadId,
        slug,
      });
    }

    const currentChannel = [...channels, ...dms, ...publicChannels].find(
      (c) => c.id === thread.channel?.id
    )!;

    return {
      props: {
        ...props,
        thread: serializeThread(thread),
        currentChannel,
        isBot: isCrawler,
        isSubDomainRouting: isSubdomainbasedRouting,
      },
    };
  } catch (exception) {
    console.error(exception);
    return NotFound();
  }
}
