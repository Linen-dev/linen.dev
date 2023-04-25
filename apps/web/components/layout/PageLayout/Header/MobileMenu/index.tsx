import React, { useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiMenu } from '@react-icons/all-files/fi/FiMenu';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiLogOut } from '@react-icons/all-files/fi/FiLogOut';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiFileText } from '@react-icons/all-files/fi/FiFileText';
import Link from 'components/Link/InternalLink';
import Modal from '@linen/ui/Modal';
import styles from './index.module.scss';
import { Permissions, SerializedChannel } from '@linen/types';
import { signOut } from 'utilities/auth/react';
import usePath from 'hooks/path';

interface Props {
  channels: SerializedChannel[];
  channelName?: string;
  fontColor: string;
  permissions: Permissions;
}

export default function MobileMenu({
  channels,
  channelName,
  permissions,
  fontColor,
}: Props) {
  const [show, setOpen] = useState(false);
  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const router = useRouter();

  const paths = {
    inbox: usePath({ href: '/inbox' }),
    metrics: usePath({ href: '/metrics' }),
    configurations: usePath({ href: '/configurations' }),
    branding: usePath({ href: '/branding' }),
    members: usePath({ href: '/members' }),
    plans: usePath({ href: '/plans' }),
  };

  return (
    <>
      <FiMenu
        className={styles.open}
        style={{ color: fontColor }}
        onClick={open}
      />
      <Modal open={show} close={close} fullscreen>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.text}>Menu</div>
            <FiMenu className={styles.close} onClick={close} />
          </div>
          <ul className={styles.list}>
            {permissions.inbox && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.inbox === router.asPath,
                  })}
                  href="/inbox"
                >
                  <FiInbox /> Inbox
                </Link>
              </li>
            )}
            {permissions.manage && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.configurations === router.asPath,
                  })}
                  href="/configurations"
                >
                  <FiFileText /> Configurations
                </Link>
              </li>
            )}
            {permissions.manage && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.branding === router.asPath,
                  })}
                  href="/branding"
                >
                  <FiSliders /> Branding
                </Link>
              </li>
            )}
            {permissions.manage && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.members === router.asPath,
                  })}
                  href="/members"
                >
                  <FiUsers /> Members
                </Link>
              </li>
            )}
            {permissions.manage && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.plans === router.asPath,
                  })}
                  href="/plans"
                >
                  <FiZap /> Plans
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

            {permissions.manage && (
              <li className={styles.subheader}>Analytics</li>
            )}
            {permissions.manage && (
              <li>
                <Link
                  onClick={close}
                  className={classNames(styles.link, {
                    [styles.active]: paths.metrics === router.asPath,
                  })}
                  href="/metrics"
                >
                  <FiBarChart /> Metrics
                </Link>
              </li>
            )}
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
        </div>
      </Modal>
    </>
  );
}
