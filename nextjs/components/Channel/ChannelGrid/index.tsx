import classNames from 'classnames';
import CustomLink from '../../Link/CustomLink';
import { SerializedThread } from '../../../serializers/thread';
import ChannelRow from '../ChannelRow';
import type { Settings } from 'serializers/account/settings';
import styles from './index.module.scss';

export default function ChannelGrid({
  threads,
  isSubDomainRouting,
  settings,
  isBot,
  onClick,
}: {
  threads: SerializedThread[];
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  onClick: (threadId: number) => void;
}) {
  return (
    <>
      {threads
        .filter((thread) => thread.messages.length > 0)
        .map(({ messages, state, incrementId, slug }, index) => {
          return (
            <li
              key={`feed-${incrementId}-${index}`}
              className={classNames(styles.li)}
            >
              {isBot ? (
                <div className="px-4 py-4">
                  <CustomLink
                    isSubDomainRouting={isSubDomainRouting}
                    communityName={settings.communityName}
                    communityType={settings.communityType}
                    path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
                    key={`${incrementId}-desktop`}
                  >
                    <ChannelRow
                      incrementId={incrementId}
                      messages={messages}
                      state={state}
                      isSubDomainRouting={isSubDomainRouting}
                      settings={settings}
                      slug={slug}
                    />
                  </CustomLink>
                </div>
              ) : (
                <div className="px-4 py-4" onClick={() => onClick(incrementId)}>
                  <ChannelRow
                    incrementId={incrementId}
                    messages={messages}
                    state={state}
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
