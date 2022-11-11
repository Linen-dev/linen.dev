import React, { useState } from 'react';
import classNames from 'classnames';
import { FiBarChart, FiMenu, FiHash, FiRss, FiLogOut } from 'react-icons/fi';
import Link from 'components/Link/InternalLink';
import Modal from 'components/Modal';
import styles from './index.module.scss';
import { SerializedChannel } from 'serializers/channel';
import { Permissions } from 'types/shared';
import { signOut } from 'next-auth/react';

interface Props {
  channels: SerializedChannel[];
  channelName?: string;
  permissions: Permissions;
}

export default function MobileMenu({
  channels,
  channelName,
  permissions,
}: Props) {
  const [show, setOpen] = useState(false);
  const open = () => setOpen(true);
  const close = () => setOpen(false);
  return (
    <>
      <FiMenu className={styles.open} onClick={open} />
      <Modal open={show} close={close} fullscreen>
        <div className={styles.header}>
          <div className={styles.text}>Pages</div>
          <FiMenu className={styles.close} onClick={close} />
        </div>
        <ul className={styles.list}>
          {permissions.feed && (
            <li>
              <Link onClick={close} className={styles.link} href="/feed">
                <FiRss /> Feed
              </Link>
            </li>
          )}
          {permissions.manage && (
            <li>
              <Link onClick={close} className={styles.link} href="/metrics">
                <FiBarChart /> Metrics
              </Link>
            </li>
          )}
          <li className={styles.subheader}>Channels</li>
          {channels
            .sort((a, b) => a.channelName.localeCompare(b.channelName))
            .map((channel, index) => {
              return (
                <li key={channel.channelName + index}>
                  <Link
                    className={classNames(styles.link, {
                      [styles.active]: channel.channelName === channelName,
                    })}
                    onClick={close}
                    href={`/c/${channel.channelName}`}
                  >
                    <FiHash /> {channel.channelName}
                  </Link>
                </li>
              );
            })}
          {permissions.user && permissions.is_member && (
            <li className={styles.subheader}>Actions</li>
          )}
          {permissions.user && permissions.is_member && (
            <li
              onClick={() => {
                close();
                signOut();
              }}
              className={styles.link}
            >
              <FiLogOut /> Sign Out
            </li>
          )}
        </ul>
      </Modal>
    </>
  );
}
