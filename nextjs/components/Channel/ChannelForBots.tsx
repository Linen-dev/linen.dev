import { useEffect, useState } from 'react';

import CustomLinkHelper from 'components/Link/CustomLinkHelper';
import ButtonPagination from 'components/ButtonPagination';

import ChannelGrid from 'components/Channel/ChannelGrid';
import { SerializedThread } from 'serializers/thread';
import { ChannelViewProps } from 'components/Pages/ChannelsPage';

export function ChannelForBots({
  threads,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  isBot,
}: ChannelViewProps) {
  const [currentThreads, setCurrentThreads] = useState<SerializedThread[]>();

  useEffect(() => {
    setCurrentThreads(threads);
  }, [threads]);

  if (!threads) {
    return <div />;
  }

  return (
    <>
      <div
        className="
        overflow-hidden
        hover:overflow-auto
        pr-4
        hover:pr-0
        lg:h-[calc(100vh_-_64px)]
        md:h-[calc(100vh_-_144px)] 
        h-[calc(100vh_-_152px)]
        lg:w-[calc(100vw_-_200px)]
        flex justify-center
        w-[100vw]
        "
      >
        <div className="sm:pt-6 justify-center">
          <ul className="divide-y sm:max-w-4xl px-1">
            <ChannelGrid
              threads={currentThreads}
              isSubDomainRouting={isSubDomainRouting}
              settings={settings}
              isBot={isBot}
              onClick={() => {}}
            />
            <div className="text-center p-4">
              {nextCursor?.prev && (
                <ButtonPagination
                  href={CustomLinkHelper({
                    isSubDomainRouting,
                    communityName: settings.communityName,
                    communityType: settings.communityType,
                    path: `/c/${channelName}/${nextCursor.prev}`,
                  })}
                  label="Previous"
                />
              )}
              {nextCursor?.next && (
                <ButtonPagination
                  href={CustomLinkHelper({
                    isSubDomainRouting,
                    communityName: settings.communityName,
                    communityType: settings.communityType,
                    path: `/c/${channelName}/${nextCursor.next}`,
                  })}
                  label="Next"
                  className="ml-3"
                />
              )}
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}
