import CustomLinkHelper from 'components/Link/CustomLinkHelper';
import ButtonPagination from 'components/ButtonPagination';

import Grid from './Grid';
import { Settings } from 'serializers/account/settings';
import { SerializedThread } from 'serializers/thread';
import { Permissions } from 'types/shared';

interface Props {
  settings: Settings;
  channelName: string;
  threads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  isBot: boolean;
  permissions: Permissions;
}

export default function ChannelForBots({
  threads,
  settings,
  permissions,
  channelName,
  isSubDomainRouting,
  nextCursor,
  isBot,
}: Props) {
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
            <Grid
              threads={threads}
              permissions={permissions}
              isSubDomainRouting={isSubDomainRouting}
              settings={settings}
              isBot={isBot}
              currentUser={null}
              onClick={() => {}}
              onPin={() => {}}
              onReaction={() => {}}
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
