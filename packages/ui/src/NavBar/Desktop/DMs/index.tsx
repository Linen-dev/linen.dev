import React from 'react';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import Nav from '@/Nav';
import classNames from 'classnames';
import styles from './index.module.scss';
import { Permissions, SerializedChannel } from '@linen/types';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { useState } from 'react';
import { timestamp } from '@linen/utilities/date';
import NewDmModal from '@/NewDmModal';
import type { ApiClient } from '@linen/api-client';

type Props = {
  permissions: Permissions;
  dms: SerializedChannel[];
  channelName?: string;
  highlights: string[];
  debouncedUpdateReadStatus: Function;
  setHighlights: Function;
  Link: (args: any) => JSX.Element;
  api: ApiClient;
  CustomRouterPush({
    isSubDomainRouting,
    path,
    communityName,
    communityType,
  }: any): void;
};

function ToggleIcon({
  dms,
  show,
}: {
  dms: SerializedChannel[];
  show: boolean;
}) {
  if (!dms || dms.filter((dm) => !dm.hidden).length === 0) {
    return null;
  }
  return show ? <FiChevronUp /> : <FiChevronDown />;
}

export function DMs({
  permissions,
  dms: initialDms,
  channelName,
  highlights,
  debouncedUpdateReadStatus,
  setHighlights,
  Link,
  api,
  CustomRouterPush,
}: Props) {
  const [show, toggle] = useState(true);
  const [modal, setModal] = useState(false);
  const [dms, setDms] = useState(initialDms);

  return (
    <>
      <Nav.Group onClick={() => toggle((show) => !show)}>
        Direct
        {!!permissions.accountId && (
          <>
            <div className={styles.flex}>
              <FiPlus
                className={styles.cursorPointer}
                onClick={(event) => {
                  event.stopPropagation();
                  setModal(true);
                }}
              />
              <ToggleIcon dms={dms} show={show} />
            </div>

            <NewDmModal
              communityId={permissions.accountId}
              setDms={setDms}
              show={modal}
              close={() => setModal(false)}
              CustomRouterPush={CustomRouterPush}
              api={api}
            />
          </>
        )}
      </Nav.Group>
      {show && (
        <>
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
              return null;
            }

            const onArchiveClick = () => {
              const id = channel.id;
              const accountId = permissions.accountId;
              accountId &&
                api.archiveChannel({ channelId: id, accountId }).then(() => {
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
              <div
                className={classNames('group', styles.flexDiv)}
                key={`${channel.id}-${index}`}
              >
                <Link
                  className={classNames(styles.item)}
                  onClick={() => {
                    debouncedUpdateReadStatus(channel.id, timestamp());
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
                  <Nav.Item
                    className={styles.justify}
                    active={active}
                    highlighted={highlighted}
                  >
                    <div className={styles.user}>
                      <FiUser /> {channel.channelName}
                    </div>
                    <div className={styles.archive} onClick={onArchiveClick}>
                      <FiX />
                    </div>
                  </Nav.Item>
                </Link>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
