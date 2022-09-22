import { users } from '@prisma/client';
import CustomLink from '../Link/CustomLink';
import { SerializedThread } from '../../serializers/thread';
import { MessageCard } from '../MessageCard';
import type { Settings } from 'serializers/account/settings';

export function Feed({
  threads,
  isSubDomainRouting,
  settings,
  isBot,
  onClick,
}: {
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  onClick: (threadId: number) => void;
}) {
  return (
    <>
      {threads
        ?.filter((thread) => thread.messages.length > 0)
        .map(({ messages, incrementId, slug }: SerializedThread) => {
          return (
            <li
              key={incrementId}
              className="px-4 py-4 hover:bg-blue-50 border-solid border-gray-200 cursor-pointer w-full"
            >
              {isBot ? (
                <CustomLink
                  isSubDomainRouting={isSubDomainRouting}
                  communityName={settings.communityName}
                  communityType={settings.communityType}
                  path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
                  key={`${incrementId}-desktop`}
                >
                  <MessageCard
                    incrementId={incrementId}
                    messages={messages}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    slug={slug}
                  />
                </CustomLink>
              ) : (
                <div onClick={() => onClick(incrementId)}>
                  <MessageCard
                    incrementId={incrementId}
                    messages={messages}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    slug={slug}
                  />
                </div>
              )}
            </li>
          );
        })}
    </>
  );
}
