import NewDmModal from 'components/Modals/NewDmModal';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { Nav } from '@linen/ui';
import Link from 'components/Link/InternalLink';
import classNames from 'classnames';
import styles from '../index.module.scss';
import { Permissions, SerializedChannel } from '@linen/types';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { useState } from 'react';
import { archiveChannel } from 'utilities/requests';

type Props = {
  permissions: Permissions;
  dms: SerializedChannel[];
  channelName: string;
  highlights: string[];
  debouncedUpdateReadStatus: Function;
  setHighlights: Function;
};

export function DMs({
  permissions,
  dms: initDms,
  channelName,
  highlights,
  debouncedUpdateReadStatus,
  setHighlights,
}: Props) {
  const [dms, setDms] = useState(initDms);
  if (!dms || !dms.length) {
    return <></>;
  }
  return (
    <>
      <Nav.Group>
        DMs
        {!!permissions.accountId && (
          <NewDmModal communityId={permissions.accountId} setDms={setDms} />
        )}
      </Nav.Group>
      <div>
        {dms.map((channel: SerializedChannel, index: number) => {
          const count = highlights.reduce((count: number, id: string) => {
            if (id === channel.id) {
              return count + 1;
            }
            return count;
          }, 0);

          const active = channel.channelName === channelName;
          const highlighted = !active && count > 0;

          if (!highlighted && channel.hidden) {
            return <></>;
          }

          return (
            <div className="group flex" key={`${channel.id}-${index}`}>
              <Link
                className={classNames(styles.item, 'grow')}
                onClick={() => {
                  debouncedUpdateReadStatus(channel.id);
                  setHighlights((highlights: any) => {
                    return highlights.filter((id: any) => id !== channel.id);
                  });
                  if (channel.hidden) {
                    setDms((dms) => {
                      return dms.map((dm) => {
                        if (dm.id === channel.id) {
                          return { ...dm, hidden: false };
                        }
                        return dm;
                      });
                    });
                  }
                }}
                key={`${channel.id}-${index}`}
                href={`/c/${channel.id}`}
              >
                <Nav.Item active={active} highlighted={highlighted}>
                  <FiUser /> {channel.channelName}
                </Nav.Item>
              </Link>
              <Archive
                {...{
                  active,
                  id: channel.id,
                  setDms,
                  accountId: permissions.accountId,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function Archive({
  active,
  id,
  setDms,
  accountId,
}: {
  active: boolean;
  id: string;
  setDms: React.Dispatch<React.SetStateAction<SerializedChannel[]>>;
  accountId: string | null;
}) {
  const onArchiveClick = () => {
    accountId &&
      archiveChannel({ channelId: id, accountId }).then(() => {
        setDms((dms) => {
          return dms.map((dm) => {
            if (dm.id === id) {
              return { ...dm, hidden: true };
            }
            return dm;
          });
        });
      });
  };
  return (
    <button
      aria-label="Archive Conversation"
      title="archive"
      type="button"
      onClick={() => {
        onArchiveClick();
      }}
      className={classNames(
        'hidden group-hover:block text-gray-500 text-sm font-medium mb-1',
        {
          ['bg-gray-100']: active,
        }
      )}
    >
      <div className="flex justify-end pr-2">
        <FiX />
      </div>
    </button>
  );
}
