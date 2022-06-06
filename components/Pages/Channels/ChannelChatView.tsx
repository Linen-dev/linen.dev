import Avatar, { Size } from '../../Avatar';
import { useEffect, useState } from 'react';
import Pagination from '../../Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { capitalize } from '../../../lib/util';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { Props, messageWithAuthor } from '.';
import { Anchor, Text } from '@mantine/core';
import { AiOutlineLink } from 'react-icons/ai';
import styles from './ChannelChatView.module.css';

function Messages({ messages }: { messages?: messageWithAuthor[] }) {
  return (
    <div>
      <ul role="list" className="divide-y divide-gray-200">
        {messages?.map((message) => (
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
  }, [messages, pagination]);

  if (!messages) {
    return <div></div>;
  }

  // Todo: handle missing channels
  const channelName = channels?.find((c) => c.id === channelId)?.channelName;
  const handlePageClick = ({ selected }: { selected: number }) => {
    const newPage = selected + 1;
    if (newPage == currentPage) return;
    CustomRouterPush({
      communityType: settings.communityType,
      isSubDomainRouting,
      communityName,
      path: `/c/${currentChannel.channelName}/${newPage}`,
    });
    setCurrentPage(newPage);
  };

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
        <Messages messages={currentThreads} />

        <div className="gap-8 columns-2">
          <div className={styles.buttons}>
            <Anchor
              className={styles.join}
              href={slackInviteUrl || slackUrl}
              size="sm"
              target="_blank"
            >
              <div className="flex content-center">
                <AiOutlineLink className={styles.icon} size={18} />
                {settings.communityType === 'discord' ? (
                  <div>Join thread in Discord</div>
                ) : (
                  <div>Join thread in Slack</div>
                )}
              </div>
            </Anchor>
          </div>
        </div>

        {!!pageCount && (
          <Pagination
            channelName={currentChannel.channelName}
            onClick={handlePageClick}
            pageCount={pageCount}
            communityName={communityName}
            isSubDomainRouting={isSubDomainRouting}
            initialPage={page ? page - 1 : 0}
            communityType={settings.communityType}
          />
        )}
      </div>
    </PageLayout>
  );
}
