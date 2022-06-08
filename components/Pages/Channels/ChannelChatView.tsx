import Avatar, { Size } from '../../Avatar';
import { useEffect, useState } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { capitalize } from '../../../lib/util';
import { Props, messageWithAuthor } from '.';
import { Anchor, Loader, Text } from '@mantine/core';
import { AiOutlineLink } from 'react-icons/ai';
import styles from './ChannelChatView.module.css';
import { channels } from '@prisma/client';
import { Settings } from 'services/communities';
import useSWRImmutable from 'swr/immutable';

function sortMessagesFromTopDown(a: messageWithAuthor, b: messageWithAuthor) {
  return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
}

function Messages({ messages }: { messages?: messageWithAuthor[] }) {
  return (
    <div>
      <ul role="list" className="divide-y divide-gray-200">
        {messages?.sort(sortMessagesFromTopDown).map((message) => (
          <li className="pb-8" key={message.id}>
            <div className="flex justify-between">
              <div className="flex pb-4">
                <Avatar
                  size={Size.lg}
                  alt={message.author?.displayName || 'avatar'}
                  src={message.author?.profileImageUrl}
                  text={(message.author?.displayName || '?')
                    .slice(0, 1)
                    .toLowerCase()}
                />
                <div className="pl-3">
                  <p className="font-semibold text-sm inline-block">
                    {message.author?.displayName || 'user'}
                  </p>
                </div>
              </div>
              <Text size="sm" color="gray">
                {format(new Date(message.sentAt))}
              </Text>
            </div>
            <div style={{ maxWidth: '700px' }}>
              <Message
                text={message.body}
                mentions={message.mentions?.map((m) => m.users)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChannelChatView({
  channelId,
  users,
  messages,
  channels,
  slackUrl,
  slackInviteUrl,
  currentChannel,
  settings,
  communityName,
  pagination,
  page,
  isSubDomainRouting,
}: Props) {
  const [currentThreads, setCurrentThreads] = useState(messages);
  const [pageCount, setPageCount] = useState(pagination?.pageCount);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setCurrentThreads(messages);
    setPageCount(pagination?.pageCount);
    window.scrollTo(0, 0);
    setCurrentPage(page);
  }, [messages, pagination, page]);

  if (!messages) {
    return <div></div>;
  }

  // Todo: handle missing channels
  const channelName = channels?.find((c) => c.id === channelId)?.channelName;

  function buildTitle(
    communityName: string,
    channelName: string | undefined,
    page: number = 1
  ) {
    const name = capitalize(communityName);
    const channel = !!channelName
      ? ` - ${capitalize(channelName)} Threads - Page ${page}`
      : '';
    return `${name}${channel}`;
  }

  const pages: any[] = [];
  for (let i = page; i < currentPage; i++) {
    pages.unshift(
      <PageWrapper index={i} key={i} channelId={currentChannel.id} />
    );
  }

  return (
    //Super hacky mobile friendly - different component gets
    //rendered when it is smaller than a specific size and gets unhidden
    <PageLayout
      users={users}
      slackUrl={slackUrl}
      slackInviteUrl={slackInviteUrl}
      currentChannel={currentChannel}
      seo={{
        title: buildTitle(
          settings.name || communityName,
          channelName,
          currentPage
        ),
        // description: `${channelName} Threads - Page ${page}`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="py-8 px-4">
        {!!(pageCount && currentPage <= pageCount) && (
          <LoadMore onClick={() => setCurrentPage(currentPage + 1)} />
        )}
        {pages}
        <Messages messages={currentThreads} />

        <div className="gap-8 columns-2">
          <div className={styles.buttons}>
            <Anchor
              className={styles.join}
              href={buildInviteLink(
                { ...settings, slackInviteUrl },
                currentChannel
              )}
              size="sm"
              target="_blank"
            >
              <div className="flex content-center">
                <AiOutlineLink className={styles.icon} size={18} />
                {settings.communityType === 'discord' ? (
                  <div>Join channel in Discord</div>
                ) : (
                  <div>Join channel in Slack</div>
                )}
              </div>
            </Anchor>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function buildInviteLink(
  settings: Settings & { slackInviteUrl?: string },
  currentChannel: channels
) {
  if (!settings.slackInviteUrl) return '';
  if (settings.communityType === 'discord') {
    return `${settings.slackInviteUrl}/${currentChannel.slackChannelId}`;
  } else {
    return settings.slackInviteUrl;
  }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function PageWrapper({
  index,
  channelId,
}: {
  index: number;
  channelId: string;
}) {
  const { data, error } = useSWRImmutable(
    `/api/messages?channelId=${channelId}&page=${index + 1}`,
    fetcher
  );
  if (error) return <></>;
  return data ? (
    <Messages messages={data} />
  ) : (
    <div className="flex justify-center p-4">
      <Loader size="sm" />
    </div>
  );
}

function LoadMore({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pb-4">
      <Anchor onClick={onClick} size="sm">
        Load More
      </Anchor>
    </div>
  );
}
