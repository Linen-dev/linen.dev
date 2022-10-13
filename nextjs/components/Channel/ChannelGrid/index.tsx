import classNames from 'classnames';
import CustomLink from '../../Link/CustomLink';
import { SerializedThread } from '../../../serializers/thread';
import ChannelRow from '../ChannelRow';
import type { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import styles from './index.module.scss';

export default function ChannelGrid({
  threads,
  permissions,
  isSubDomainRouting,
  settings,
  isBot,
  onClick,
  onPin,
}: {
  threads: SerializedThread[];
  permissions: Permissions;
  isSubDomainRouting: boolean;
  settings: Settings;
  isBot: boolean;
  onClick: (threadId: number) => void;
  onPin: (threadId: string) => void;
}) {
  return (
    <>
      {threads
        .filter((thread) => thread.messages.length > 0)
        .map((thread, index) => {
          const { incrementId, slug } = thread;
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
                      thread={thread}
                      permissions={permissions}
                      isSubDomainRouting={isSubDomainRouting}
                      settings={settings}
                      onPin={onPin}
                    />
                  </CustomLink>
                </div>
              ) : (
                <div className="px-4 py-4" onClick={() => onClick(incrementId)}>
                  <ChannelRow
                    thread={thread}
                    permissions={permissions}
                    isSubDomainRouting={isSubDomainRouting}
                    settings={settings}
                    onPin={onPin}
                  />
                </div>
              )}
            </li>
          );
        })}
    </>
  );
}
