import Avatar from '../../Avatar';
import { useEffect, useState } from 'react';
import Pagination from '../../Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { capitalize } from '../../../lib/util';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { Props, messageWithAuthor } from '.';

function Messages({ messages }: { messages?: messageWithAuthor[] }) {
  return (
    <div>
      <ul role="list" className="divide-y divide-gray-200">
        {messages?.map((message) => (
          <li key={message.id} className="py-4 max-w-[800px] min-w-[350px]">
            <div className="flex space-x-3">
              {message.author && (
                <Avatar
                  key={`${message.id}-${
                    message.author.id || message.author.displayName
                  }-avatar-mobile}`}
                  src={message.author.profileImageUrl || ''} //  set placeholder with a U sign
                  alt={message.author.displayName || ''} // Set placeholder of a slack user if missing
                  text={(message.author.displayName || '?')
                    .slice(0, 1)
                    .toLowerCase()}
                />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {message.author?.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 min-w-[120px]">
                    {format(new Date(message.sentAt))}
                  </p>
                </div>
                <Message
                  text={message.body}
                  mentions={message.mentions?.map((m) => m.users)}
                />
              </div>
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
      <div className="sm:pt-6">
        <Messages messages={currentThreads} />

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
